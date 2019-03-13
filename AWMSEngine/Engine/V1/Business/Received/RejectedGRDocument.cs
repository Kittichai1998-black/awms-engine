using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.Engine.Business.Issued;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using AWMSModel.Criteria.SP.Request;
using AWMSModel.Criteria.SP.Response;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business.Received
{
    public class RejectedGRDocument : BaseEngine<RejectedGRDocument.TDocReq, RejectedGRDocument.TDocRes>
    {

        public class TDocReq
        {
            public List<long> docIDs;
            public long areaID=3;
        }
        public class TDocRes
        {
            public List<amt_Document> documents;
        }

        protected override TDocRes ExecuteEngine(TDocReq reqVO)
        {
            var docReceivs = ADO.DocumentADO.GetInstant().ListAndRelationSupper(reqVO.docIDs, this.BuVO);
            var docNotCloseds = docReceivs.Where(x => x.EventStatus != DocumentEventStatus.CLOSING && x.EventStatus != DocumentEventStatus.IDLE);
            if (docNotCloseds.Count() > 0)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "เอกสารรับเข้า '" + (string.Join(',', docNotCloseds.Select(x => x.Code).ToArray())) + "' ต้องมีสถานะ IDLE หรือ CLOSING เท่านั้น");

            List<SPOutSTORootCanUseCriteria> rootStos = new List<SPOutSTORootCanUseCriteria>();
            List<amt_DocumentItem> docItems = new List<amt_DocumentItem>();
            docReceivs.ForEach(doc =>
            {
                var rtStos = ADO.StorageObjectADO.GetInstant().ListBaseInDoc(doc.ID.Value, null, doc.DocumentType_ID, this.BuVO);
                rootStos.AddRange(rtStos);
                ADO.DocumentADO.GetInstant().UpdateStatusToChild(doc.ID.Value, null, EntityStatus.ACTIVE, DocumentEventStatus.REJECTED, this.BuVO);
                //doc.DocumentItems = ADO.DocumentADO.GetInstant().ListItemAndDisto(doc.ID.Value, this.BuVO);
                docItems.AddRange(doc.DocumentItems);
            });

            List<amt_Document> docIssues = new List<amt_Document>();
            //List<long> bstoIDForReturns = rootStos.Select(x => x.id).Distinct().ToList();
            foreach (var docRecv in docReceivs)
            {
                var docIssue = new Engine.Business.Issued.CreateDocument().Execute(
                                this.Logger,
                                this.BuVO,
                                new Issued.CreateDocument.TReq()
                                {
                                    parentDocumentID = docRecv.ID,
                                    souBranchID = docRecv.Des_Branch_ID,
                                    souWarehouseID = docRecv.Des_Warehouse_ID,
                                    souAreaMasterID = docRecv.Des_AreaMaster_ID,
                                    desBranchID = docRecv.Sou_Branch_ID,
                                    desWarehouseID = docRecv.Sou_Warehouse_ID,
                                    desAreaMasterID = docRecv.Sou_AreaMaster_ID,
                                    desCustomerID = docRecv.Sou_Customer_ID,
                                    desSupplierID = docRecv.Sou_Supplier_ID,
                                    eventStatus = DocumentEventStatus.WORKING,
                                    batch = docRecv.Batch,
                                    lot = docRecv.Lot,

                                    actionTime = DateTime.Now,
                                    documentDate = DateTime.Now,
                                    remark = "Return by " + docRecv.Code,
                                    refID = string.Empty,
                                    ref2 = "RETURN",

                                    issueItems = docRecv.DocumentItems.Select(
                                        x => new Issued.CreateDocument.TReq.IssueItem
                                        {
                                            lot = x.Lot,
                                            batch = x.Batch,
                                            orderNo = x.OrderNo,
                                            unitType = StaticValue.UnitTypes.First(ut => ut.ID == x.UnitType_ID).Code,
                                            quantity = rootStos.Where(y => y.docItemID == x.ID.Value).Sum(y => y.distoQty),
                                            packID = x.PackMaster_ID,
                                            options = x.Options ?? "" + "&doci_id=" + x.ID,
                                            productionDate = x.ProductionDate,
                                            expireDate = x.ExpireDate,
                                            refID = x.RefID,
                                            ref1 = x.Ref1,
                                            ref2 = "RETURN",
                                            eventStatus = DocumentEventStatus.WORKING

                                        }).ToList()
                                });

                docIssues.Add(docIssue);

            }

            ConfirmQueueIssue.TReq reqQueue = new ConfirmQueueIssue.TReq();
            reqQueue.DocumentProcessed = new List<ConfirmQueueIssue.TReq.DocumentProcess>();

            foreach(var docIssue in docIssues)
            {
                foreach(var docRecvItem in docReceivs.First(x=>x.ID == docIssue.ParentDocument_ID).DocumentItems)
                {
                    foreach (var rtSto in rootStos
                        .FindAll(x => x.docItemID == docRecvItem.ID)
                        .GroupBy(x => new {
                            id = x.id,
                            packCode = x.packCode,
                            baseCode = x.code,
                            areaID = x.areaID,
                            batch = x.batch,
                            lot = x.lot,
                            orderNo = x.orderNo,
                            distoBaseUnitID = x.distoBaseUnitID,
                            warehouseID = x.warehouseID,
                        }))
                    {
                        var docIssueItem = docIssue.DocumentItems.First(x =>
                        AMWUtil.Common.ObjectUtil.QryStrGetValue(x.Options, "doci_id") == docRecvItem.ID.Value.ToString());
                        reqQueue.DocumentProcessed.Add(new ConfirmQueueIssue.TReq.DocumentProcess()
                        {
                            stoi = rtSto.Key.id,
                            baseCode = rtSto.Key.baseCode,
                            itemCode = rtSto.Key.packCode,
                            docID = docIssue.ID.Value,
                            docCode = docIssue.Code,
                            dociID = docIssueItem.ID.Value,
                            areaID = reqVO.areaID,
                            batch = rtSto.Key.batch,
                            lot = rtSto.Key.lot,
                            orderNo = rtSto.Key.orderNo,
                            priority = 2,
                            qty = rtSto.Sum(x => x.distoQty),
                            stoBaseQty = rtSto.Sum(x => x.distoBaseUnitID),
                            wareHouseID = rtSto.Key.warehouseID,
                        });
                    }
                }
            }

            var resQueue = new ConfirmQueueIssue().Execute(this.Logger, this.BuVO, reqQueue);
            //if (true) throw new Exception("test");
            return new TDocRes() { documents = docReceivs };
        }
        
    }
}
