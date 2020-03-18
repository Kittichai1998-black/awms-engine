using AMWUtil.Common;
using AMWUtil.Exception;
using AMWUtil.Logger;
using AWMSEngine.ADO.StaticValue;
using AWMSEngine.Common;
using AWMSEngine.Engine;
using AWMSEngine.Engine.V2.Business;
using AWMSEngine.Engine.V2.Business.Issued;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using AWMSEngine.ADO.QueueApi;
using System.Threading.Tasks;
using static AWMSEngine.Engine.V2.Business.WorkQueue.ASRSProcessQueue.TReq;
using AWMSEngine.Engine.V2.Business.WorkQueue;
using AWMSModel.Criteria.SP.Request;

namespace ProjectTMC.Engine.WorkQueue
{
    public class IssueForScada : BaseEngine<IssueForScada.TReq, IssueForScada.TRes>
    {

        public class TReq
        {
            public string interface_no;
            public string ref_id;
            public string sku_code;
            public int qty;

        }
        public class ResConfirmResult
        {
            public List<RootStoProcess> confirmResult;
            public List<amt_Document> docGRCrossDocks;
        }
        public class TRes
        {
            public string doc_code;
            public string ref_id;
            public string sku_code;
            public int qty;
            public string unit;

        }

        protected override TRes ExecuteEngine(TReq reqVO)
        {
            TRes res = new TRes();
            amt_Document docGI = new amt_Document();
            ResConfirmResult dataProcessQ = new ResConfirmResult();
            var StaticValue = AWMSEngine.ADO.StaticValue.StaticValueManager.GetInstant();
            var sku = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<ams_SKUMaster>(
                new SQLConditionCriteria[] {
                        new SQLConditionCriteria("Code",reqVO.sku_code, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("Status","1",SQLOperatorType.EQUALS)
            }, this.BuVO).FirstOrDefault();

            var skuType = AWMSEngine.ADO.DataADO.GetInstant().SelectByID<ams_SKUMasterType>(sku.SKUMasterType_ID, this.BuVO);
            
            

            if (reqVO.interface_no == "2.1")
            {
                if (skuType.GroupType != SKUGroupType.RAW)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "SKU Type is : "+ skuType.Code);

                //this.checkQtyInSto(reqVO.sku_code, reqVO.qty, "SA2", this.BuVO);

                docGI = this.createDoc(this.Logger, reqVO, "SRM02", "SA2", "SRM02", "IP", DocumentProcessTypeID.RAW_TRANSFER, this.BuVO);

                if (docGI == null)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Document unsucessful");

                dataProcessQ = this.AutoProcess(docGI,false,"G01", reqVO,this.BuVO);

                if (dataProcessQ == null)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ProcessQueue unsucessful");

            }
            else if (reqVO.interface_no == "4.1")
            {
                if (skuType.GroupType != SKUGroupType.WIP)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "SKU Type is : " + skuType.Code);

                //this.checkQtyInSto(reqVO.sku_code, reqVO.qty, "OB", this.BuVO);

                docGI = this.createDoc(this.Logger, reqVO, "SRM02", "SA2", "SRM02", "IP", DocumentProcessTypeID.WIP_TRANSFER_WM, this.BuVO);

                if (docGI == null)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Document unsucessful");

                dataProcessQ = this.AutoProcess(docGI, false, "G08", reqVO, this.BuVO);

                if (dataProcessQ == null)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ProcessQueue unsucessful");


            }
            else if (reqVO.interface_no == "7.1")
            {
                if (skuType.GroupType != SKUGroupType.WIP)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "SKU Type is : " + skuType.Code);

                docGI = this.createDoc(this.Logger, reqVO, "SRM02", "Out", "SRM02", "IP", DocumentProcessTypeID.WIP_TRANSFER_WM, this.BuVO);

                if (docGI == null)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Document unsucessful");

                dataProcessQ = this.AutoProcess(docGI, true, "G13", reqVO, this.BuVO);

                if (dataProcessQ == null)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ProcessQueue unsucessful");
            }
            else if (reqVO.interface_no != "9.1")
            {
                if (skuType.GroupType == SKUGroupType.WIP)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "SKU Type is : " + skuType.Code);

                docGI = this.createDoc(this.Logger, reqVO, "SRM02", "Out", "SRM02", "IP", DocumentProcessTypeID.WIP_TRANSFER_WM, this.BuVO);

                if (docGI == null)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Document unsucessful");

                dataProcessQ = this.AutoProcess(docGI, false, "G13", reqVO, this.BuVO);

                if (dataProcessQ == null)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ProcessQueue unsucessful");
            }
            else
            {
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Interface No. Not Match");
            }

            res.doc_code = docGI.Code;
            res.ref_id = reqVO.ref_id;
            res.sku_code = sku.Code;
            res.unit = StaticValue.UnitTypes.First(x => x.ID == sku.UnitType_ID).Code; 
            res.qty = reqVO.qty;


            return res;
        }

            private amt_Document createDoc(AMWLogger logger, TReq reqVO,string souWH,string souArea,string desWH,string desArea,DocumentProcessTypeID movement, VOCriteria buVO)
        {
            var StaticValue = AWMSEngine.ADO.StaticValue.StaticValueManager.GetInstant();
            amt_Document doc = new amt_Document();
            List<amt_DocumentItem> docItems = new List<amt_DocumentItem>();

            var pack = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<ams_PackMaster>(
               new SQLConditionCriteria[] {
                        new SQLConditionCriteria("Code",reqVO.sku_code, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("Status",1,SQLOperatorType.EQUALS)
           }, buVO).FirstOrDefault();


            doc = new CreateGIDocument().Execute(logger, buVO,
                new CreateGIDocument.TReq()
                {
                    refID = null,
                    ref1 = null,
                    ref2 = null,
                    souBranchID = null,
                    souWarehouseID = StaticValue.Warehouses.First(x => x.Code == souWH).ID,
                    souAreaMasterID = StaticValue.AreaMasters.First(x => x.Code == souArea).ID,
                    desBranchID = null,
                    desWarehouseID = desWH == null? null: StaticValue.Warehouses.First(x => x.Code == desWH).ID,
                    desAreaMasterID = StaticValue.AreaMasters.First(x => x.Code == desArea).ID,
                    movementTypeID = movement,
                    lot = null,
                    batch = null,
                    documentDate = DateTime.Now,
                    actionTime = DateTime.Now,
                    eventStatus = DocumentEventStatus.NEW,
                    issueItems = new List<CreateGIDocument.TReq.IssueItem>() {
                                    new CreateGIDocument.TReq.IssueItem
                                    {
                                    packCode = pack.Code,
                                    quantity = reqVO.qty,
                                    unitType = StaticValue.UnitTypes.First(x => x.ID == pack.UnitType_ID).Code,
                                    batch = null,
                                    lot = null,
                                    orderNo = null ,
                                    ref2 = null,
                                    eventStatus = DocumentEventStatus.NEW
                                    }}
                });

            docItems.AddRange(doc.DocumentItems);

            return doc;
        }
        private ResConfirmResult AutoProcess(amt_Document Document,bool Inc,string desLoc, TReq reqVO, VOCriteria buVO)
        {
            //var docItems = AWMSEngine.ADO.DocumentADO.GetInstant().ListItemAndDisto(Document.ID.Value, this.BuVO);

            ResConfirmResult res = new ResConfirmResult();
            var StaticValue = AWMSEngine.ADO.StaticValue.StaticValueManager.GetInstant();

            var docItem = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_DocumentItem>(
                new SQLConditionCriteria[] {
                    new SQLConditionCriteria("Document_ID",Document.ID.Value, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("Status",1,SQLOperatorType.EQUALS)
                }, buVO).FirstOrDefault();

            var conditionsProcess = new List<SPInSTOProcessQueueCriteria.ConditionProcess>()
                { new SPInSTOProcessQueueCriteria.ConditionProcess()
                    {
                        baseQty= docItem.BaseQuantity,
                        batch = null,
                        lot = null,
                        orderNo = null,
                        options = null
                    }
                 };
            var eventStatusesProcess = new List<StorageObjectEventStatus>()
            {
                StorageObjectEventStatus.RECEIVED
            };
            var OrderByProcess = new List<SPInSTOProcessQueueCriteria.OrderByProcess>() { 
                new SPInSTOProcessQueueCriteria.OrderByProcess()
                {
                    fieldName = "psto.createtime",
                    orderByType = 0
                }
            
            };

            var dataProcessWQ = new List<ProcessQueueCriteria>()
                 { new ProcessQueueCriteria()
                     {
                        docID = docItem.Document_ID,
                        docItemID = docItem.ID.Value,
                        locationCode = null,
                        baseCode = null,
                        skuCode = docItem.Code,
                        priority = 2,
                        useShelfLifeDate = false,
                        useExpireDate = false,
                        useIncubateDate = Inc,
                        useFullPick = true,
                        conditions = conditionsProcess,
                        eventStatuses = eventStatusesProcess,
                        orderBys = OrderByProcess,
                        baseQty = docItem.BaseQuantity
                        //percentRandom = 100
                     }

                 };


            var wq = new ASRSProcessQueue.TReq()
            {
                desASRSWarehouseCode = StaticValue.Warehouses.First(x => x.ID == Document.Des_Warehouse_ID).Code,
                desASRSAreaCode = StaticValue.AreaMasters.First(x => x.ID == Document.Des_AreaMaster_ID).Code,
                desASRSLocationCode = desLoc,
                processQueues = dataProcessWQ,
                lockNotExistsRandom = false,
            };

            var processQ = new AWMSEngine.Engine.V2.Business.WorkQueue.ASRSProcessQueue();
            var resProcess = processQ.Execute(this.Logger, this.BuVO, wq);

            resProcess.processResults.ForEach(x =>
            {
                x.processResultItems.ForEach(resItems =>
                {
                    if(resItems.pickStos.Count == 0)
                        throw new AMWException(this.Logger, AMWExceptionCode.V1001, "SKU not in Storage");

                });
            });

            var dataConfirmprocess = new ASRSConfirmProcessQueue.TReq()
            {
                isSetQtyAfterDoneWQ = false,
                desASRSAreaCode = resProcess.desASRSAreaCode,
                desASRSLocationCode = resProcess.desASRSLocationCode,
                desASRSWarehouseCode = resProcess.desASRSWarehouseCode,
                processResults = resProcess.processResults
            };


            var confirmprocess = new AWMSEngine.Engine.V2.Business.WorkQueue.ASRSConfirmProcessQueue();
            var resConfirmprocess = confirmprocess.Execute(this.Logger, this.BuVO, dataConfirmprocess);

            res.confirmResult = resConfirmprocess.confirmResult;
            res.docGRCrossDocks = resConfirmprocess.docGRCrossDocks;

            return res;
        }



    }
}
