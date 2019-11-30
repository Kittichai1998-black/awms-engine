using AMWUtil.Common;
using AMWUtil.Exception;
using AMWUtil.Logger;
using AWMSEngine.Engine.V2.Business.Issued;
using AWMSEngine.Engine.V2.Business.WorkQueue;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using AWMSModel.Criteria.SP.Request;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using static AWMSEngine.Engine.V2.Business.WorkQueue.ASRSProcessQueue.TReq;

namespace AWMSEngine.Engine.V2.Business.Received
{
    public class RejectGRDocument : BaseEngine<RejectGRDocument.TDocReq, RejectGRDocument.TDocRes>
    {

        public class TDocReq
        {
            public long[] docIDs;
            public long desArea;
        }
        public class TDocRes
        {
            public List<amt_Document> documents;
        }

        protected override TDocRes ExecuteEngine(TDocReq reqVO)
        {
            foreach (var docID in reqVO.docIDs)
            {
                //AWMSEngine.ADO.DocumentADO.GetInstant().UpdateStatusToChild(docID,
                //DocumentEventStatus.CLOSING, null, DocumentEventStatus.REJECTED, this.BuVO);
                amt_Document doc = new amt_Document();
                var DocClose = AWMSEngine.ADO.DataADO.GetInstant().SelectByID<amt_Document>(docID, this.BuVO);

                var docItem = AWMSEngine.ADO.DocumentADO.GetInstant().ListItemAndDisto(docID, this.BuVO);

                //var DocItemClose = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_DocumentItem>("Document_ID", DocClose.ID, this.BuVO);
                var issueItems = new List<CreateGIDocument.TReq.IssueItem>();
                foreach (var distos in docItem)
                {
                    var getWorkQueue = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_WorkQueue>(
                        new SQLConditionCriteria[] {
                        new SQLConditionCriteria("ID",distos.DocItemStos[0].WorkQueue_ID, AWMSModel.Constant.EnumConst.SQLOperatorType.EQUALS),
                        }, this.BuVO).FirstOrDefault();
                    //docItem.DocItemStos[0].WorkQueue_ID;


                    issueItems.Add(new CreateGIDocument.TReq.IssueItem
                    {
                        skuCode = distos.Code,
                        packCode = distos.Code,
                        quantity = distos.Quantity,
                        unitType = StaticValue.UnitTypes.First(x => x.ID == distos.UnitType_ID).Code,
                        lot = distos.Lot,
                        orderNo = distos.OrderNo,
                        batch = distos.Batch,
                        options = AMWUtil.Common.ObjectUtil.QryStrSetValue(doc.Options, "palletcode", string.Join(", ", getWorkQueue.StorageObject_Code)),
                        ref1 = distos.Ref1,
                        ref2 = distos.Ref2,
                        refID = distos.RefID,
                        eventStatus = DocumentEventStatus.NEW,
                    });
                }
                doc = new CreateGIDocument().Execute(this.Logger, this.BuVO,
                                  new CreateGIDocument.TReq()
                                  {
                                      refID = DocClose.RefID,
                                      ref1 = DocClose.Ref1,
                                      ref2 = DocClose.Ref2,
                                      souBranchID = null,
                                      souWarehouseID = DocClose.Sou_Warehouse_ID,
                                      souAreaMasterID = DocClose.Sou_AreaMaster_ID,
                                      desBranchID = DocClose.Des_Branch_ID,
                                      desWarehouseID = DocClose.Des_Warehouse_ID,
                                      desAreaMasterID = DocClose.Des_AreaMaster_ID,
                                      movementTypeID = MovementType.FG_TRANSFER_REJECT,
                                      lot = DocClose.Lot,
                                      batch = DocClose.Batch,
                                      forCustomerID = DocClose.For_Customer_ID,
                                      documentDate = DateTime.Now,
                                      actionTime = DateTime.Now,
                                      eventStatus = DocumentEventStatus.NEW,
                                      issueItems = issueItems
                                  });
                this.ProcessQ(reqVO, doc);
            }

            return null;
        }
        private void ProcessQ(TDocReq reqVO, amt_Document docGI)
        {
            var DocItems = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_DocumentItem>("Document_ID", docGI.ID, this.BuVO);

            foreach (var DocItem in DocItems)
            {
                var palletOptions = AMWUtil.Common.ObjectUtil.QryStrGetValue(DocItem.Options, "palletcode");

                var pallet = AWMSEngine.ADO.StorageObjectADO.GetInstant().Get(palletOptions, null, null, false, true, this.BuVO);
                //var locationcode = AWMSEngine.ADO.DataADO.GetInstant().SelectByID<ams_AreaLocationMaster>(pallet.parentID, this.BuVO).Code;

                var conditions = new List<SPInSTOProcessQueueCriteria.ConditionProcess>();
                conditions.Add(new SPInSTOProcessQueueCriteria.ConditionProcess()
                {
                    batch = null,
                    baseQty = null,
                    lot = null,
                    options = null,
                    orderNo = null
                });
                var orderBys = new List<SPInSTOProcessQueueCriteria.OrderByProcess>();
                orderBys.Add(new SPInSTOProcessQueueCriteria.OrderByProcess()
                {
                    fieldName = null,
                    orderByType = SQLOrderByType.DESC
                });

                var eventStatuses = new List<StorageObjectEventStatus>();

                var dataProcessQ = new List<ProcessQueueCriteria>();
                dataProcessQ.Add(new ProcessQueueCriteria()
                {
                    docID = docGI.ID.Value,
                    docItemID = DocItem.ID.Value,

                    locationCode = AWMSEngine.ADO.DataADO.GetInstant().SelectByID<ams_AreaLocationMaster>(pallet.parentID, this.BuVO).Code,
                    baseCode = pallet.code,
                    skuCode = pallet.mapstos[0].code,

                    priority = 0,

                    useShelfLifeDate = false,
                    useExpireDate = false,
                    useIncubateDate = false,
                    useFullPick = true,

                    baseQty = pallet.mapstos[0].baseQty,
                    percentRandom = null,

                    conditions = conditions,
                    eventStatuses = eventStatuses,
                    orderBys = orderBys



                });


                var asrsProcess = new ASRSProcessQueue.TReq
                {
                    desASRSAreaCode = "",
                    desASRSLocationCode = "",
                    desASRSWarehouseCode = "",
                    lockNotExistsRandom = false,
                    processQueues = dataProcessQ

                };
            }


            //var process = new ASRSProcessQueue().Execute(this.Logger,this.BuVO,)
        }
    }
}
