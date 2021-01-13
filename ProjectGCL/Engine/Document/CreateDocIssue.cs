using AMWUtil.Logger;
using AWMSEngine.Engine;
using AWMSModel.Constant.EnumConst;
using AWMSEngine.Engine.V2.Business.WorkQueue;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Exception;
using AWMSEngine.Common;
using AMWUtil.Common;
using AWMSModel.Criteria.SP.Request;
using AWMSModel.Criteria.SP.Response;
using AWMSModel.Constant.StringConst;
using AWMSEngine.Engine.V2.Business.Document;
using GCLModel.Criteria;
using AWMSEngine.Engine.V2.Business.Received;
using AWMSEngine.Engine.V2.Business.Issued;
using static AWMSEngine.Engine.V2.Business.WorkQueue.ASRSProcessQueue.TReq;

namespace ProjectGCL.Engine.Document
{
    public class CreateDocIssue : BaseEngine<CreateDocIssue.TReq, CreateDocIssue.TRes>
    {

        public class TReq : AMWRequestCreateGIDoc
        {
        }
        public class TRes
        {
            public string api_ref;
            public string doc_wms;
            public string doc_wcs;
        }
        public class ResConfirmResult
        {
            public List<RootStoProcess> confirmResult;
            public List<amt_Document> docGRCrossDocks;
        }
        protected override TRes ExecuteEngine(TReq reqVO)
        {
            amt_Document document = new amt_Document();
            ResConfirmResult dataProcessQ = new ResConfirmResult();

            if (String.IsNullOrWhiteSpace(reqVO.api_ref))
                throw new AMWException(this.BuVO.Logger, AMWExceptionCode.S0001, "api_ref เป็นค่าว่าง");

            if (String.IsNullOrWhiteSpace(reqVO.doc_wms))
                throw new AMWException(this.BuVO.Logger, AMWExceptionCode.S0001, "doc_wms เป็นค่าว่าง");

            if (String.IsNullOrWhiteSpace(reqVO.grade))
                throw new AMWException(this.BuVO.Logger, AMWExceptionCode.S0001, "grade เป็นค่าว่าง");

            if (String.IsNullOrWhiteSpace(reqVO.sku))
                throw new AMWException(this.BuVO.Logger, AMWExceptionCode.S0001, "sku เป็นค่าว่าง");

            if (String.IsNullOrWhiteSpace(reqVO.unit))
                throw new AMWException(this.BuVO.Logger, AMWExceptionCode.S0001, "unit เป็นค่าว่าง");


            var customer = ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_Customer>(
                    new SQLConditionCriteria[] {
                        new SQLConditionCriteria("Code",reqVO.customer, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("Status",1,SQLOperatorType.EQUALS)
                    }, this.BuVO).FirstOrDefault();

            if (customer == null)
                throw new AMWException(this.BuVO.Logger, AMWExceptionCode.S0001, "ไม่มี customer นี้ในระบบ");

            var sku = ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_SKUMaster>(
                    new SQLConditionCriteria[] {
                        new SQLConditionCriteria("Code",reqVO.sku, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("Status",1,SQLOperatorType.EQUALS)
                    }, this.BuVO).FirstOrDefault();

            if (sku == null)
                throw new AMWException(this.BuVO.Logger, AMWExceptionCode.S0001, "ไม่มี sku นี้ในระบบ");

            var warehouse = ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_Warehouse>(
                    new SQLConditionCriteria[] {
                        new SQLConditionCriteria("Code",reqVO.warehouse, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("Status",1,SQLOperatorType.EQUALS)
                    }, this.BuVO).FirstOrDefault();

            if (warehouse == null)
                throw new AMWException(this.BuVO.Logger, AMWExceptionCode.S0001, "ไม่มี warehouse นี้ในระบบ");

            var documentGRCheck = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_Document>(
                    new SQLConditionCriteria[] {
                        new SQLConditionCriteria("refID",reqVO.doc_wms, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("DocumentType_ID",DocumentTypeID.GOODS_RECEIVE,SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("Status",2,SQLOperatorType.NOTEQUALS)
                    }, this.BuVO).FirstOrDefault();

            var documentPACheck = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_Document>(
                    new SQLConditionCriteria[] {
                                    new SQLConditionCriteria("refID",reqVO.doc_wms, SQLOperatorType.EQUALS),
                                    new SQLConditionCriteria("DocumentType_ID",DocumentTypeID.PUTAWAY,SQLOperatorType.EQUALS),
                                    new SQLConditionCriteria("Status",2,SQLOperatorType.NOTEQUALS)
                    }, this.BuVO).FirstOrDefault();

            if (documentGRCheck != null)
            {
                if (documentGRCheck.EventStatus == DocumentEventStatus.NEW)
                {
                    ADO.WMSDB.DocumentADO.GetInstant().UpdateStatusToChild(documentGRCheck.ID.Value, DocumentEventStatus.NEW, EntityStatus.ACTIVE, DocumentEventStatus.REJECTED, this.BuVO);
                    if (documentPACheck != null)
                    {
                        ADO.WMSDB.DocumentADO.GetInstant().UpdateStatusToChild(documentPACheck.ID.Value, DocumentEventStatus.NEW, EntityStatus.ACTIVE, DocumentEventStatus.REJECTED, this.BuVO);
                    }
                    document = this.CreateDocGI(this.Logger, reqVO, warehouse, customer, sku, this.BuVO);
                    this.CreateDocPK(this.Logger, reqVO, warehouse, customer, sku, document, this.BuVO);
                    dataProcessQ = this.AutoProcess(document, false, reqVO, this.BuVO);

                   
                }
                else if (documentGRCheck.EventStatus == DocumentEventStatus.WORKING)
                {
                    throw new AMWException(this.BuVO.Logger, AMWExceptionCode.S0001, "ไม่สามารถสร้างเอกสารได้เพราะมีเอกสารที่กำลังทำงานอยู่");
                }

            }
            else
            {
                document = this.CreateDocGI(this.Logger, reqVO, warehouse, customer, sku, this.BuVO);
                this.CreateDocPK(this.Logger, reqVO, warehouse, customer, sku, document, this.BuVO);
            }

            if (dataProcessQ == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Process Queue ไม่สำเร็จ");

            var res = new TRes()
            {
                api_ref = reqVO.api_ref,
                doc_wms = reqVO.doc_wms,
                doc_wcs = document.Code

            };
            return res;
        }
        private amt_Document CreateDocGI(AMWLogger logger, TReq reqVO, ams_Warehouse warehouse, ams_Customer customer, ams_SKUMaster sku, VOCriteria buVO)
        {
            amt_Document docResultGI = new amt_Document();
            List<CreateGIDocument.TReq.IssueItem> docItemsList = new List<CreateGIDocument.TReq.IssueItem>();

            var optionsDocItems = AMWUtil.Common.ObjectUtil.QryStrSetValue("", GCLOptionVOConst.OPT_DISCHARGE, reqVO.staging);
            optionsDocItems = AMWUtil.Common.ObjectUtil.QryStrSetValue(optionsDocItems, GCLOptionVOConst.OPT_START_PALLET, reqVO.dock);

            AuditStatus AdditStatus = EnumUtil.GetValueEnum<AuditStatus>(reqVO.status);

            var docH = new CreateGIDocument.TReq()
            {
                documentTypeID = DocumentTypeID.GOODS_ISSUE,
                ref1 = reqVO.grade,
                ref2 = reqVO.doc_wms,
                ref3 = reqVO.dock,
                souBranchID = null,
                souAreaMasterID = null,
                desBranchID = null,
                forCustomerCode = reqVO.customer,
                documentProcessTypeID = DocumentProcessTypeID.FG_TRANSFER_WM,
                lot = reqVO.lot,
                batch = null,
                documentDate = DateTime.Now,
                actionTime = DateTime.Now,
                eventStatus = DocumentEventStatus.NEW,
                desWarehouseCode = reqVO.warehouse,
                options = optionsDocItems

            };

            docItemsList.Add(new CreateGIDocument.TReq.IssueItem
            {
                skuCode = sku.Code,
                quantity = reqVO.qty,
                baseQuantity = reqVO.qty,
                unitType = StaticValue.UnitTypes.First(x => x.Code == reqVO.unit).Code,
                baseunitType = StaticValue.UnitTypes.First(x => x.Code == reqVO.unit).Code,
                batch = null,
                lot = reqVO.lot,
                orderNo = null,
                ref1 = reqVO.grade,
                ref2 = reqVO.doc_wms,
                ref3 = reqVO.dock,
                auditStatus = AdditStatus,
                eventStatus = DocumentEventStatus.NEW,
                options = optionsDocItems

            });

            docH.issueItems = docItemsList;
            docResultGI = new CreateGIDocument().Execute(Logger, this.BuVO, docH);

            return docResultGI;

        }

        private amt_Document CreateDocPK(AMWLogger logger, TReq reqVO, ams_Warehouse warehouse, ams_Customer customer, ams_SKUMaster sku, amt_Document DocGI, VOCriteria buVO)
        {
            amt_Document docResultPK = new amt_Document();
            List<CreateGIDocument.TReq.IssueItem> docItemsList = new List<CreateGIDocument.TReq.IssueItem>();

            var optionsDocItems = AMWUtil.Common.ObjectUtil.QryStrSetValue("", GCLOptionVOConst.OPT_DISCHARGE, reqVO.staging);
            optionsDocItems = AMWUtil.Common.ObjectUtil.QryStrSetValue(optionsDocItems, GCLOptionVOConst.OPT_START_PALLET, reqVO.dock);
            AuditStatus AdditStatus = EnumUtil.GetValueEnum<AuditStatus>(reqVO.status);

            var docH = new CreateGIDocument.TReq()
            {
                documentTypeID = DocumentTypeID.PICKING,
                parentDocumentID = DocGI.ID.Value,
                ref1 = reqVO.grade,
                ref2 = reqVO.doc_wms,
                ref3 = reqVO.dock,
                souBranchID = null,
                souAreaMasterID = null,
                desBranchID = null,
                forCustomerCode = reqVO.customer,
                documentProcessTypeID = DocumentProcessTypeID.FG_TRANSFER_WM,
                lot = reqVO.lot,
                batch = null,
                documentDate = DateTime.Now,
                actionTime = DateTime.Now,
                eventStatus = DocumentEventStatus.NEW,
                desWarehouseCode = reqVO.warehouse,
                options = optionsDocItems

            };

            docItemsList.Add(new CreateGIDocument.TReq.IssueItem
            {
                skuCode = sku.Code,
                quantity = reqVO.qty,
                baseQuantity = reqVO.qty,
                unitType = StaticValue.UnitTypes.First(x => x.Code == reqVO.unit).Code,
                baseunitType = StaticValue.UnitTypes.First(x => x.Code == reqVO.unit).Code,
                batch = null,
                lot = reqVO.lot,
                orderNo = null,
                ref1 = reqVO.grade,
                ref2 = reqVO.doc_wms,
                ref3 = reqVO.dock,
                auditStatus = AdditStatus,
                eventStatus = DocumentEventStatus.NEW,
                options = optionsDocItems

            });

            docH.issueItems = docItemsList;
            docResultPK = new CreateGIDocument().Execute(Logger, this.BuVO, docH);

            return docResultPK;

        }

        private ResConfirmResult AutoProcess(amt_Document Document, bool pickfull, TReq reqVO, VOCriteria buVO)
        {
            //var docItems = AWMSEngine.ADO.DocumentADO.GetInstant().ListItemAndDisto(Document.ID.Value, this.BuVO);

            ResConfirmResult res = new ResConfirmResult();
            var StaticValue = ADO.WMSStaticValue.StaticValueManager.GetInstant();

            var docItem = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_DocumentItem>(
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
            var auditStatusesProcess = new List<AuditStatus>()
            {
                AuditStatus.QUARANTINE
            };
            var OrderByProcess = new List<SPInSTOProcessQueueCriteria.OrderByProcess>() {
                new SPInSTOProcessQueueCriteria.OrderByProcess()
                {
                     fieldName ="psto.lot,psto.createtime",
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
                        useIncubateDate = false ,
                        useFullPick = pickfull,
                        conditions = conditionsProcess,
                        eventStatuses = eventStatusesProcess,
                        auditStatuses = auditStatusesProcess,
                        orderBys = OrderByProcess,
                        baseQty = docItem.BaseQuantity
                        //percentRandom = 100
                     }

                 };


            var wq = new ASRSProcessQueue.TReq()
            {
                desASRSWarehouseCode = StaticValue.Warehouses.First(x => x.Code == reqVO.warehouse).Code,
                desASRSAreaCode = StaticValue.AreaMasters.First(x => x.Code == reqVO.staging).Code,
                desASRSLocationCode = null,
                processQueues = dataProcessWQ,
                lockNotExistsRandom = false,
            };

            var processQ = new AWMSEngine.Engine.V2.Business.WorkQueue.ASRSProcessQueue();
            var resProcess = processQ.Execute(this.Logger, this.BuVO, wq);

            resProcess.processResults.ForEach(x =>
            {
                x.processResultItems.ForEach(resItems =>
                {
                    if (resItems.pickStos.Count == 0)
                        throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่มีสินค้า " + reqVO.sku + " ในคลัง");

                    resItems.pickStos.ForEach(y =>
                    {
                        if (y.pickQty == 0)
                            throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่มีสินค้า " + reqVO.sku + " ในคลัง");

                    });


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


            return res;
        }


    }
}
