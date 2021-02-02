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
using System.Text.RegularExpressions;

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
            this.Chacknull(this.Logger, reqVO, this.BuVO);
            var staging =  this.genStaging(this.Logger, reqVO, this.BuVO);

            var customer = ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_Customer>(
                    new SQLConditionCriteria[] {
                        new SQLConditionCriteria("Code",reqVO.customer, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("Status",1,SQLOperatorType.EQUALS)
                    }, this.BuVO).FirstOrDefault();

            if (customer == null)
                throw new AMWException(this.BuVO.Logger, AMWExceptionCode.S0001, "ไม่มี customer นี้ในระบบ");

            //var area = ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_AreaMaster>(
            //       new SQLConditionCriteria[] {
            //            new SQLConditionCriteria("Code",reqVO.staging, SQLOperatorType.EQUALS),
            //            new SQLConditionCriteria("Status",1,SQLOperatorType.EQUALS)
            //       }, this.BuVO).FirstOrDefault();

            //if (area == null)
            //    throw new AMWException(this.BuVO.Logger, AMWExceptionCode.S0001, "ไม่มี staging นี้ในระบบ");

            var sku = ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_SKUMaster>(
                    new SQLConditionCriteria[] {
                        new SQLConditionCriteria("Code",reqVO.sku, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("Status",1,SQLOperatorType.EQUALS)
                    }, this.BuVO).FirstOrDefault();

            if (sku == null)
                throw new AMWException(this.BuVO.Logger, AMWExceptionCode.S0001, "ไม่มี sku นี้ในระบบ");

            var pack = ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_PackMaster>(
                    new SQLConditionCriteria[] {
                        new SQLConditionCriteria("SKUMaster_ID",sku.ID.Value, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("Status",1,SQLOperatorType.EQUALS)
                    }, this.BuVO).FirstOrDefault();

            if (pack == null)
                throw new AMWException(this.BuVO.Logger, AMWExceptionCode.S0001, "ไม่มี pack นี้ในระบบ");

            var warehouse = ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_Warehouse>(
                    new SQLConditionCriteria[] {
                        new SQLConditionCriteria("Code",reqVO.warehouse, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("Status",1,SQLOperatorType.EQUALS)
                    }, this.BuVO).FirstOrDefault();

            if (warehouse == null)
                throw new AMWException(this.BuVO.Logger, AMWExceptionCode.S0001, "ไม่มี warehouse นี้ในระบบ");

            var documentGICheck = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_Document>(
                    new SQLConditionCriteria[] {
                        new SQLConditionCriteria("ref2",reqVO.doc_wms, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("DocumentType_ID",DocumentTypeID.GOODS_ISSUE,SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("Status",2,SQLOperatorType.NOTEQUALS)
                    }, this.BuVO).FirstOrDefault();

            var documentPKCheck = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_Document>(
                    new SQLConditionCriteria[] {
                                    new SQLConditionCriteria("ref2",reqVO.doc_wms, SQLOperatorType.EQUALS),
                                    new SQLConditionCriteria("DocumentType_ID",DocumentTypeID.PICKING,SQLOperatorType.EQUALS),
                                    new SQLConditionCriteria("Status",2,SQLOperatorType.NOTEQUALS)
                    }, this.BuVO).FirstOrDefault();

            var area = ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_AreaMaster>(
                    new SQLConditionCriteria[] {
                                    new SQLConditionCriteria("Code",reqVO.staging,SQLOperatorType.EQUALS),
                                    new SQLConditionCriteria("AreaMasterType_ID",AreaMasterTypeID.STO_STAGING, SQLOperatorType.EQUALS),
                                    new SQLConditionCriteria("Status",1,SQLOperatorType.EQUALS)
                    }, this.BuVO).FirstOrDefault();

            if (documentGICheck != null)
            {
                if (documentGICheck.EventStatus == DocumentEventStatus.NEW)
                {
                    ADO.WMSDB.DocumentADO.GetInstant().UpdateStatusToChild(documentGICheck.ID.Value, DocumentEventStatus.NEW, EntityStatus.ACTIVE, DocumentEventStatus.REJECTED, this.BuVO);
                    if (documentPKCheck != null)
                    {
                        ADO.WMSDB.DocumentADO.GetInstant().UpdateStatusToChild(documentPKCheck.ID.Value, DocumentEventStatus.NEW, EntityStatus.ACTIVE, DocumentEventStatus.REJECTED, this.BuVO);
                    }
                    document = this.CreateDocGI(this.Logger, reqVO, warehouse, staging,area, customer, sku, pack, this.BuVO);
                    this.CreateDocPK(this.Logger, reqVO, warehouse, staging, area, customer, sku, pack, document, this.BuVO);
                    //dataProcessQ = this.AutoProcess(document, true,staging, reqVO, this.BuVO);


                }
                else if (documentGICheck.EventStatus == DocumentEventStatus.WORKING)
                {
                    throw new AMWException(this.BuVO.Logger, AMWExceptionCode.S0001, "ไม่สามารถสร้างเอกสารได้เพราะมีเอกสารที่กำลังทำงานอยู่");
                }

            }
            else
            {
                document = this.CreateDocGI(this.Logger, reqVO, warehouse,staging,area, customer, sku, pack, this.BuVO);
                this.CreateDocPK(this.Logger, reqVO, warehouse,staging, area, customer, sku, pack, document, this.BuVO);
                //dataProcessQ = this.AutoProcess(document, true, staging, reqVO, this.BuVO);
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
        private amt_Document CreateDocGI(AMWLogger logger, TReq reqVO, ams_Warehouse warehouse,ams_AreaMaster staging,ams_AreaMaster area, ams_Customer customer, ams_SKUMaster sku, ams_PackMaster pack, VOCriteria buVO)
        {
            amt_Document docResultGI = new amt_Document();
            List<CreateGIDocument.TReq.IssueItem> docItemsList = new List<CreateGIDocument.TReq.IssueItem>();

            var optionsDocItems = AMWUtil.Common.ObjectUtil.QryStrSetValue("", GCLOptionVOConst.OPT_STAGING, reqVO.staging);
            optionsDocItems = AMWUtil.Common.ObjectUtil.QryStrSetValue(optionsDocItems, GCLOptionVOConst.OPT_DOCK,string.IsNullOrWhiteSpace(reqVO.dock) ? (area != null ? reqVO.staging : staging.Code) : reqVO.dock);
        
            AuditStatus AdditStatus = EnumUtil.GetValueEnum<AuditStatus>(reqVO.status);

            var docH = new CreateGIDocument.TReq()
            {
                documentTypeID = DocumentTypeID.GOODS_ISSUE,
                ref1 = reqVO.grade,
                ref2 = reqVO.doc_wms,
                ref3 = string.IsNullOrWhiteSpace(reqVO.dock) ? (area != null? reqVO.staging:staging.Code) : reqVO.dock,
                souBranchID = null,
                desAreaMasterCode= staging.Code,
                desBranchID = null,
                forCustomerCode = reqVO.customer,
                documentProcessTypeID = DocumentProcessTypeID.FG_TRANSFER_WM,
                lot = reqVO.lot,
                batch = null,
                documentDate = DateTime.Now,
                actionTime = DateTime.Now,
                eventStatus = DocumentEventStatus.NEW,
                souWarehouseCode = reqVO.warehouse,
                desWarehouseCode = reqVO.warehouse,
                options = optionsDocItems

            };

            docItemsList.Add(new CreateGIDocument.TReq.IssueItem
            {
                skuCode = sku.Code,
                packCode = pack.Code,
                quantity = reqVO.qty,
                baseQuantity = reqVO.qty,
                unitType = StaticValue.UnitTypes.First(x => x.Code == reqVO.unit).Code,
                baseunitType = StaticValue.UnitTypes.First(x => x.Code == reqVO.unit).Code,
                batch = null,
                lot = reqVO.lot,
                orderNo = null,
                ref1 = reqVO.grade,
                ref2 = reqVO.doc_wms,
                ref3 = string.IsNullOrWhiteSpace(reqVO.dock) ? (area != null ? reqVO.staging : staging.Code) : reqVO.dock,
                auditStatus = AdditStatus,
                eventStatus = DocumentEventStatus.NEW,
                options = optionsDocItems

            });

            docH.issueItems = docItemsList;
            docResultGI = new CreateGIDocument().Execute(Logger, this.BuVO, docH);

            return docResultGI;

        }

        private amt_Document CreateDocPK(AMWLogger logger, TReq reqVO, ams_Warehouse warehouse,ams_AreaMaster staging,ams_AreaMaster area, ams_Customer customer, ams_SKUMaster sku, ams_PackMaster pack, amt_Document DocGI, VOCriteria buVO)
        {
            amt_Document docResultPK = new amt_Document();
            List<CreateGIDocument.TReq.IssueItem> docItemsList = new List<CreateGIDocument.TReq.IssueItem>();

            var optionsDocItems = AMWUtil.Common.ObjectUtil.QryStrSetValue("", GCLOptionVOConst.OPT_STAGING, reqVO.staging);
            optionsDocItems = AMWUtil.Common.ObjectUtil.QryStrSetValue(optionsDocItems, GCLOptionVOConst.OPT_DOCK,string.IsNullOrWhiteSpace(reqVO.dock) ? (area != null ? reqVO.staging : staging.Code) : reqVO.dock);
          
            AuditStatus AdditStatus = EnumUtil.GetValueEnum<AuditStatus>(reqVO.status);

            var docH = new CreateGIDocument.TReq()
            {
                documentTypeID = DocumentTypeID.PICKING,
                parentDocumentID = DocGI.ID.Value,
                ref1 = reqVO.grade,
                ref2 = reqVO.doc_wms,
                ref3 = string.IsNullOrWhiteSpace(reqVO.dock) ? (area != null ? reqVO.staging : staging.Code) : reqVO.dock,
                souBranchID = null,
                desAreaMasterCode = staging.Code,
                desBranchID = null,
                forCustomerCode = reqVO.customer,
                documentProcessTypeID = DocumentProcessTypeID.FG_TRANSFER_WM,
                lot = reqVO.lot,
                batch = null,
                documentDate = DateTime.Now,
                actionTime = DateTime.Now,
                eventStatus = DocumentEventStatus.NEW,
                souWarehouseCode = reqVO.warehouse,
                desWarehouseCode = reqVO.warehouse,
                options = optionsDocItems

            };

            docItemsList.Add(new CreateGIDocument.TReq.IssueItem
            {
                skuCode = sku.Code,
                packCode = pack.Code,
                quantity = reqVO.qty,
                baseQuantity = reqVO.qty,
                unitType = StaticValue.UnitTypes.First(x => x.Code == reqVO.unit).Code,
                baseunitType = StaticValue.UnitTypes.First(x => x.Code == reqVO.unit).Code,
                batch = null,
                lot = reqVO.lot,
                orderNo = null,
                ref1 = reqVO.grade,
                ref2 = reqVO.doc_wms,
                ref3 = string.IsNullOrWhiteSpace(reqVO.dock) ? (area != null ? reqVO.staging : staging.Code) : reqVO.dock,
                auditStatus = AdditStatus,
                eventStatus = DocumentEventStatus.NEW,
                options = optionsDocItems

            });

            docH.issueItems = docItemsList;
            docResultPK = new CreateGIDocument().Execute(Logger, this.BuVO, docH);

            return docResultPK;

        }

        private ResConfirmResult AutoProcess(amt_Document Document, bool pickfull,ams_AreaMaster staging, TReq reqVO, VOCriteria buVO)
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
                desASRSAreaCode = StaticValue.AreaMasters.First(x => x.Code == staging.Code).Code,
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

                    if (resItems.pickStos.Count < reqVO.qty)
                        throw new AMWException(this.Logger, AMWExceptionCode.V1001, "สินค้า " + reqVO.sku + " มีไม่พอสำหรับการเบิก");

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


        private ams_AreaMaster genStaging(AMWLogger logger, TReq reqVO, VOCriteria buVO)
        {

            var stagingData = Regex.Replace(reqVO.staging, "^.*[^0-9]([0-9]+)$", "$1");

            if(stagingData == null)
                throw new AMWException(this.BuVO.Logger, AMWExceptionCode.S0001, "Format staging ไม่ถูกต้อง");

            ams_AreaMaster staging = new ams_AreaMaster();
            var listAreaCode = new List<int>();
            var stagingNumber = Convert.ToInt32(stagingData);
            var minStaging = new int();
            var maxStaging = new int();
            var checkMin = new int();
            var checkMax = new int();
            var resultStaging = new int();

            var areastaging = ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_AreaMaster>(
                    new SQLConditionCriteria[] {
                        new SQLConditionCriteria("Code",reqVO.staging,SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("AreaMasterType_ID",AreaMasterTypeID.STO_STAGING, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("Status",1,SQLOperatorType.EQUALS)
                    }, this.BuVO).FirstOrDefault();

            var area = ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_AreaMaster>(
                    new SQLConditionCriteria[] {
                        new SQLConditionCriteria("AreaMasterType_ID",AreaMasterTypeID.STO_STAGING, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("Status",1,SQLOperatorType.EQUALS)
                    }, this.BuVO);

            if (areastaging != null)
            {
                staging = areastaging;
            }
            else
            {
                foreach (var ar in area)
                {
                   var arData = Regex.Replace(ar.Code, "^.*[^0-9]([0-9]+)$", "$1");
                    if (arData == null)
                        throw new AMWException(this.BuVO.Logger, AMWExceptionCode.S0001, "Format staging ใน database ไม่ถูกต้อง");
                    listAreaCode.Add(Convert.ToInt32(arData));
                }

                minStaging = listAreaCode.Min();
                maxStaging = listAreaCode.Max();

                if (minStaging > stagingNumber)
                {
                    checkMin = minStaging - stagingNumber;
                }
                else
                {
                    checkMin = stagingNumber - minStaging;
                }

                if (maxStaging > stagingNumber)
                {
                    checkMax = maxStaging - stagingNumber;
                }
                else
                {
                    checkMax = stagingNumber - maxStaging;
                }

                if(checkMin < checkMax)
                {
                    resultStaging = minStaging;
                }
                else
                {
                    resultStaging = maxStaging;
                }


                staging = ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_AreaMaster>(
                           new SQLConditionCriteria[] {
                                new SQLConditionCriteria("Code","%"+resultStaging.ToString()+"%",SQLOperatorType.LIKE),
                                new SQLConditionCriteria("Status",1,SQLOperatorType.EQUALS)
                           }, this.BuVO).FirstOrDefault();

            }


            return staging;

        }
        private void Chacknull(AMWLogger logger, TReq reqVO, VOCriteria buVO)
        {
            if (String.IsNullOrWhiteSpace(reqVO.api_ref))
                throw new AMWException(this.BuVO.Logger, AMWExceptionCode.S0001, "api_ref เป็นค่าว่าง");

            if (String.IsNullOrWhiteSpace(reqVO.doc_wms))
                throw new AMWException(this.BuVO.Logger, AMWExceptionCode.S0001, "doc_wms เป็นค่าว่าง");

            if (String.IsNullOrWhiteSpace(reqVO.staging))
                throw new AMWException(this.BuVO.Logger, AMWExceptionCode.S0001, "staging เป็นค่าว่าง");

            if (String.IsNullOrWhiteSpace(reqVO.grade))
                throw new AMWException(this.BuVO.Logger, AMWExceptionCode.S0001, "grade เป็นค่าว่าง");

            if (String.IsNullOrWhiteSpace(reqVO.sku))
                throw new AMWException(this.BuVO.Logger, AMWExceptionCode.S0001, "sku เป็นค่าว่าง");

            if (String.IsNullOrWhiteSpace(reqVO.unit))
                throw new AMWException(this.BuVO.Logger, AMWExceptionCode.S0001, "unit เป็นค่าว่าง");


        }
    }
}
