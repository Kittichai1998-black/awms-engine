using AMWUtil.Logger;
using AWMSEngine.Engine;
using AMSModel.Constant.EnumConst;
using AWMSEngine.Engine.V2.Business.WorkQueue;
using AMSModel.Criteria;
using AMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Exception;
using AWMSEngine.Common;
using AMWUtil.Common;
using AMSModel.Criteria.SP.Request;
using AMSModel.Constant.StringConst;
using AWMSEngine.Engine.V2.Business.Document;
using GCLModel.Criteria;
using AWMSEngine.Engine.V2.Business.Received;
using AWMSEngine.Engine.V2.Business.Issued;
using static AWMSEngine.Engine.V2.Business.WorkQueue.ASRSProcessQueue.TReq;
using System.Text.RegularExpressions;

namespace ProjectGCL.Engine.Document
{
    public class CreateDocIssueList : BaseEngine<CreateDocIssueList.TReq, CreateDocIssueList.TRes>
    {

        public class TReq : AMWRequestCreateGIDocList
        {
        }
        public class TRes
        {
            public List<Record> Record;
        }
        public class Record
        {
            public string api_ref;
            public string doc_wms;
            public string doc_wcs;
            public DateTime Date_time;
        }
        public class ResConfirmResult
        {
            public List<RootStoProcess> confirmResult;
            public List<amt_Document> docGRCrossDocks;
            public decimal qty_s;
            public ams_AreaMaster staging;
            public string warehouse;
        }
        public class ListDoc
        {
            public decimal docID;
            public decimal qty_s;
            public string warehouse;
            public ams_AreaMaster staging;

        }
        protected override TRes ExecuteEngine(TReq reqVO)
        {
            var resRecord = new List<Record>();
            var listDocProcess = new List<ListDoc>();

            amt_Document documentPK = new amt_Document();
            ResConfirmResult dataProcessQ = new ResConfirmResult();
            ResConfirmResult dataProcessResultQ = new ResConfirmResult();
            ResConfirmResult dataProcessQ_s = new ResConfirmResult();
            foreach (var line in reqVO.RECORD)
            {
                amt_Document document = new amt_Document();
                var staging = new ams_AreaMaster();
                string[] stagingwords = line.LINE.staging.Split(",-,-");
                string[] docwords = line.LINE.Dock_no == null? stagingwords : line.LINE.Dock_no.Split(",-,-");
                staging = this.genStaging(this.Logger, stagingwords[0], this.BuVO);

                var sku = ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_SKUMaster>(
                   new SQLConditionCriteria[] {
                        new SQLConditionCriteria("Code",line.LINE.sku, SQLOperatorType.EQUALS),
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
                        new SQLConditionCriteria("Code",line.LINE.warehouse, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("Status",1,SQLOperatorType.EQUALS)
                        }, this.BuVO).FirstOrDefault();

                if (warehouse == null)
                    throw new AMWException(this.BuVO.Logger, AMWExceptionCode.S0001, "ไม่มี warehouse นี้ในระบบ");

                var area = ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_AreaMaster>(
                   new SQLConditionCriteria[] {
                                    new SQLConditionCriteria("Code",line.LINE.staging,SQLOperatorType.EQUALS),
                                    new SQLConditionCriteria("AreaMasterType_ID",AreaMasterTypeID.MC_GATE, SQLOperatorType.EQUALS),
                                    new SQLConditionCriteria("Status",1,SQLOperatorType.EQUALS)
                   }, this.BuVO).FirstOrDefault();



                document = this.CreateDocGI(this.Logger, line, warehouse, staging, area, sku, pack, docwords[0], this.BuVO);
                documentPK = this.CreateDocPK(this.Logger, line, warehouse, staging, area, sku, pack, document, docwords[0], this.BuVO);
                //dataProcessQ = this.AutoProcess(documentPK, true, staging, line, this.BuVO);

                listDocProcess.Add(new ListDoc
                {
                    docID = documentPK.ID.Value,
                    qty_s = dataProcessQ.qty_s,
                    staging = dataProcessQ.staging,
                    warehouse = line.LINE.warehouse

                });

                resRecord.Add(new Record
                {
                    api_ref = line.LINE.api_ref,
                    doc_wms = line.LINE.doc_wms,
                    doc_wcs = document.Code,
                    Date_time = line.LINE.Date_time

                });
            }


            //if (listDocProcess.Sum(y => y.qty_s) != 0)
            //{
            //    dataProcessQ_s = this.AutoProcessConfirm_s(listDocProcess, this.BuVO);
            //    dataProcessResultQ = this.AutoProcessConfirm(listDocProcess, this.BuVO);
            //}
            //else
            //{
            //    dataProcessResultQ = this.AutoProcessConfirm(listDocProcess, this.BuVO);
            //}



            var res = new TRes()
            {
                Record = resRecord
            };

            return res;

        }
        private amt_Document CreateDocGI(AMWLogger logger, AMWRequestCreateGIDocList.RECORD_LIST line, ams_Warehouse warehouse, ams_AreaMaster staging, ams_AreaMaster area, ams_SKUMaster sku, ams_PackMaster pack, string docwords, VOCriteria buVO)
        {
            amt_Document docResultGI = new amt_Document();
            List<CreateGIDocument.TReq.IssueItem> docItemsList = new List<CreateGIDocument.TReq.IssueItem>();

            var optionsDocItems = AMWUtil.Common.ObjectUtil.QryStrSetValue("", GCLOptionVOConst.OPT_STAGING, line.LINE.staging);
            optionsDocItems = AMWUtil.Common.ObjectUtil.QryStrSetValue(optionsDocItems, GCLOptionVOConst.OPT_DOCK, string.IsNullOrWhiteSpace(docwords) ? (area != null ? line.LINE.staging : staging.Code) : docwords);

            AuditStatus AdditStatus = EnumUtil.GetValueEnum<AuditStatus>(line.LINE.status);

            var docH = new CreateGIDocument.TReq()
            {
                documentTypeID = DocumentTypeID.GOODS_ISSUE,
                ref1 = line.LINE.grade,
                ref2 = line.LINE.doc_wms,
                ref3 = string.IsNullOrWhiteSpace(docwords) ? (area != null ? line.LINE.staging : staging.Code) : docwords,
                ref4 = line.LINE.group_task,
                souBranchID = null,
                desAreaMasterCode = staging.Code,
                desBranchID = null,
                //forCustomerCode = line.LINE..customer,
                documentProcessTypeID = DocumentProcessTypeID.FG_TRANSFER_WM,
                lot = line.LINE.lot,
                batch = null,
                documentDate = DateTime.Now,
                actionTime = DateTime.Now,
                eventStatus = DocumentEventStatus.NEW,
                souWarehouseCode = line.LINE.warehouse,
                desWarehouseCode = line.LINE.warehouse,
                options = optionsDocItems

            };

            docItemsList.Add(new CreateGIDocument.TReq.IssueItem
            {
                skuCode = sku.Code,
                packCode = pack.Code,
                quantity = line.LINE.qty,
                baseQuantity = line.LINE.qty,
                unitType = StaticValue.UnitTypes.First(x => x.Code == line.LINE.unit).Code,
                baseunitType = StaticValue.UnitTypes.First(x => x.Code == line.LINE.unit).Code,
                batch = null,
                lot = line.LINE.lot,
                orderNo = null,
                ref1 = line.LINE.grade,
                ref2 = line.LINE.doc_wms,
                ref3 = string.IsNullOrWhiteSpace(docwords) ? (area != null ? line.LINE.staging : staging.Code) : docwords,
                ref4 = line.LINE.group_task,
                auditStatus = AdditStatus,
                eventStatus = DocumentEventStatus.NEW,
                options = optionsDocItems

            });

            docH.issueItems = docItemsList;
            docResultGI = new CreateGIDocument().Execute(Logger, this.BuVO, docH);

            return docResultGI;

        }
        private amt_Document CreateDocPK(AMWLogger logger, AMWRequestCreateGIDocList.RECORD_LIST line, ams_Warehouse warehouse, ams_AreaMaster staging, ams_AreaMaster area, ams_SKUMaster sku, ams_PackMaster pack, amt_Document DocGI, string docwords, VOCriteria buVO)
        {
            amt_Document docResultPK = new amt_Document();
            List<CreateGIDocument.TReq.IssueItem> docItemsList = new List<CreateGIDocument.TReq.IssueItem>();

            var giDocItem = ADO.WMSDB.DocumentADO.GetInstant().ListItem(DocGI.ID.Value, this.BuVO);

            var optionsDocItems = AMWUtil.Common.ObjectUtil.QryStrSetValue("", GCLOptionVOConst.OPT_STAGING, line.LINE.staging);
            optionsDocItems = AMWUtil.Common.ObjectUtil.QryStrSetValue(optionsDocItems, GCLOptionVOConst.OPT_DOCK, string.IsNullOrWhiteSpace(docwords) ? (area != null ? line.LINE.staging : staging.Code) : docwords);

            AuditStatus AdditStatus = EnumUtil.GetValueEnum<AuditStatus>(line.LINE.status);

            var docH = new CreateGIDocument.TReq()
            {
                documentTypeID = DocumentTypeID.PICKING,
                parentDocumentID = DocGI.ID.Value,
                ref1 = line.LINE.grade,
                ref2 = line.LINE.doc_wms,
                ref3 = string.IsNullOrWhiteSpace(docwords) ? (area != null ? line.LINE.staging : staging.Code) : docwords,
                ref4 = line.LINE.group_task,
                souBranchID = null,
                desAreaMasterCode = staging.Code,
                desBranchID = null,
                forCustomerCode = line.LINE.customer,
                documentProcessTypeID = DocumentProcessTypeID.FG_TRANSFER_WM,
                lot = line.LINE.lot,
                batch = null,
                documentDate = DateTime.Now,
                actionTime = DateTime.Now,
                eventStatus = DocumentEventStatus.NEW,
                souWarehouseCode = line.LINE.warehouse,
                desWarehouseCode = line.LINE.warehouse,
                options = optionsDocItems

            };

            docItemsList.Add(new CreateGIDocument.TReq.IssueItem
            {
                parentDocumentItem_ID = giDocItem[0].ID,
                skuCode = sku.Code,
                packCode = pack.Code,
                quantity = line.LINE.qty,
                baseQuantity = line.LINE.qty,
                unitType = StaticValue.UnitTypes.First(x => x.Code == line.LINE.unit).Code,
                baseunitType = StaticValue.UnitTypes.First(x => x.Code == line.LINE.unit).Code,
                batch = null,
                lot = line.LINE.lot,
                orderNo = null,
                ref1 = line.LINE.grade,
                ref2 = line.LINE.doc_wms,
                ref3 = string.IsNullOrWhiteSpace(docwords) ? (area != null ? line.LINE.staging : staging.Code) : docwords,
                ref4 = line.LINE.group_task,
                auditStatus = AdditStatus,
                eventStatus = DocumentEventStatus.NEW,
                options = optionsDocItems

            });

            docH.issueItems = docItemsList;
            docResultPK = new CreateGIDocument().Execute(Logger, this.BuVO, docH);

            return docResultPK;

        }

        private ResConfirmResult AutoProcess(amt_Document Document, bool pickfull, ams_AreaMaster staging, AMWRequestCreateGIDocList.RECORD_LIST line, VOCriteria buVO)
        {
            //var docItems = AWMSEngine.ADO.DocumentADO.GetInstant().ListItemAndDisto(Document.ID.Value, this.BuVO);
            var qty_s = new decimal();
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
                        lot = docItem.Lot,
                        orderNo = null,
                        options = null
                    }
                 };
            var eventStatusesProcess = new List<StorageObjectEventStatus>()
            {
                StorageObjectEventStatus.PACK_RECEIVED
            };
            var auditStatusesProcess = new List<AuditStatus>()
            {
                AuditStatus.QI
            };
            var OrderByProcess = new List<SPInSTOProcessQueueCriteria.OrderByProcess>() {
                new SPInSTOProcessQueueCriteria.OrderByProcess()
                {
                     fieldName ="psto.createtime",
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
                        baseQty = docItem.BaseQuantity,

                        //percentRandom = 100
                     }

                 };


            var wq = new ASRSProcessQueue.TReq()
            {
                desASRSWarehouseCode = StaticValue.Warehouses.First(x => x.Code == line.LINE.warehouse).Code,
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
                    var xxx = resItems.pickStos.Sum(x => x.pickQty);
                    if (resItems.pickStos.Count == 0)
                        throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่มีสินค้า " + line.LINE.sku + " ในคลัง");

                    if (resItems.pickStos.Sum(x => x.pickQty) < line.LINE.qty)
                        throw new AMWException(this.Logger, AMWExceptionCode.V1001, "สินค้า " + line.LINE.sku + " มีไม่พอสำหรับการเบิก");

                    resItems.pickStos.ForEach(y =>
                    {
                        if (y.pickQty == 0)
                            throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่มีสินค้า " + line.LINE.sku + " ในคลัง");

                        qty_s = (docItem.Quantity.Value - y.pickQty);
                    });

                });
            });

            res.qty_s = qty_s;
            res.staging = staging;
            res.warehouse = line.LINE.warehouse;
            return res;
        }

        private ResConfirmResult AutoProcessConfirm_s(List<ListDoc> listdocument, VOCriteria buVO)
        {
            ResConfirmResult res = new ResConfirmResult();
            var dataProcessWQ = new List<ProcessQueueCriteria>();
            var sku = "";
            foreach (var doc in listdocument)
            {

                var StaticValue = ADO.WMSStaticValue.StaticValueManager.GetInstant();

                var docItem = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_DocumentItem>(
                    new SQLConditionCriteria[] {
                    new SQLConditionCriteria("Document_ID",doc.docID, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("Status",1,SQLOperatorType.EQUALS)
                    }, buVO).FirstOrDefault();

                var convertBase = ADO.WMSStaticValue.StaticValueManager.GetInstant().ConvertToBaseUnitBySKU(docItem.Code, doc.qty_s, docItem.UnitType_ID.Value);

                sku = docItem.Code;
                var conditionsProcess = new List<SPInSTOProcessQueueCriteria.ConditionProcess>()
                { new SPInSTOProcessQueueCriteria.ConditionProcess()
                    {
                        baseQty= convertBase.newQty,
                        batch = null,
                        lot = docItem.Lot,
                        orderNo = null,
                        options = null
                    }
                 };
                var eventStatusesProcess = new List<StorageObjectEventStatus>()
                {
                    StorageObjectEventStatus.PACK_RECEIVED
                };
                var auditStatusesProcess = new List<AuditStatus>()
                {
                    AuditStatus.QI
                };
                var OrderByProcess = new List<SPInSTOProcessQueueCriteria.OrderByProcess>() {
                    new SPInSTOProcessQueueCriteria.OrderByProcess()
                    {
                         fieldName ="psto.createtime",
                         orderByType = 0
                    }
                };

                dataProcessWQ.Add(new ProcessQueueCriteria()
                {
                    docID = docItem.Document_ID,
                    docItemID = docItem.ID.Value,
                    locationCode = null,
                    baseCode = null,
                    skuCode = docItem.Code,
                    priority = 2,
                    useShelfLifeDate = false,
                    useExpireDate = false,
                    useIncubateDate = false,
                    useFullPick = true,
                    conditions = conditionsProcess,
                    eventStatuses = eventStatusesProcess,
                    auditStatuses = auditStatusesProcess,
                    orderBys = OrderByProcess,
                    baseQty = convertBase.newQty
                    //percentRandom = 100
                });

            }



            var wq = new ASRSProcessQueue.TReq()
            {
                desASRSWarehouseCode = StaticValue.Warehouses.First(x => x.Code == listdocument[0].warehouse).Code,
                desASRSAreaCode = StaticValue.AreaMasters.First(x => x.Code == listdocument[0].staging.Code).Code,
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
                        throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่มีสินค้า " + sku + " ในคลัง");


                    resItems.pickStos.ForEach(y =>
                    {
                        if (y.pickQty == 0)
                            throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่มีสินค้า " + sku + " ในคลัง");

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

        private ResConfirmResult AutoProcessConfirm(List<ListDoc> listdocument, VOCriteria buVO)
        {
            ResConfirmResult res = new ResConfirmResult();

            var sku = "";
            foreach (var doc in listdocument)
            {

                var StaticValue = ADO.WMSStaticValue.StaticValueManager.GetInstant();

                var docItem = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_DocumentItem>(
                    new SQLConditionCriteria[] {
                    new SQLConditionCriteria("Document_ID",doc.docID, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("Status",1,SQLOperatorType.EQUALS)
                    }, buVO).FirstOrDefault();

                var convertBase = ADO.WMSStaticValue.StaticValueManager.GetInstant().ConvertToBaseUnitBySKU(docItem.Code, (docItem.Quantity.Value-doc.qty_s), docItem.UnitType_ID.Value);

                sku = docItem.Code;
                var conditionsProcess = new List<SPInSTOProcessQueueCriteria.ConditionProcess>()
                { new SPInSTOProcessQueueCriteria.ConditionProcess()
                    {
                        baseQty= convertBase.newQty,
                        batch = null,
                        lot = docItem.Lot,
                        orderNo = null,
                        options = null
                    }
                 };
                var eventStatusesProcess = new List<StorageObjectEventStatus>()
                {
                    StorageObjectEventStatus.PACK_RECEIVED
                };
                var auditStatusesProcess = new List<AuditStatus>()
                {
                    AuditStatus.QI
                };
                var OrderByProcess = new List<SPInSTOProcessQueueCriteria.OrderByProcess>() {
                    new SPInSTOProcessQueueCriteria.OrderByProcess()
                    {
                         fieldName ="psto.createtime",
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
                    useIncubateDate = false,
                    useFullPick = true,
                    conditions = conditionsProcess,
                    eventStatuses = eventStatusesProcess,
                    auditStatuses = auditStatusesProcess,
                    orderBys = OrderByProcess,
                    baseQty = convertBase.newQty
                     //percentRandom = 100
                 } };
                var wq = new ASRSProcessQueue.TReq()
                {
                    desASRSWarehouseCode = StaticValue.Warehouses.First(x => x.Code == doc.warehouse).Code,
                    desASRSAreaCode = StaticValue.AreaMasters.First(x => x.Code == doc.staging.Code).Code,
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
                            throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่มีสินค้า " + sku + " ในคลัง");


                        resItems.pickStos.ForEach(y =>
                        {
                            if (y.pickQty == 0)
                                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่มีสินค้า " + sku + " ในคลัง");

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
            }

            return res;
        }
        private ams_AreaMaster genStaging(AMWLogger logger, string stagingwords, VOCriteria buVO)
        {

            var stagingData = Regex.Replace(stagingwords, "^.*[^0-9]([0-9]+)$", "$1");

            if (stagingData == null)
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
                        new SQLConditionCriteria("Code",stagingwords,SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("AreaMasterType_ID",AreaMasterTypeID.STA_CONSO, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("Status",1,SQLOperatorType.EQUALS)
                    }, this.BuVO).FirstOrDefault();

            var area = ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_AreaMaster>(
                    new SQLConditionCriteria[] {
                        new SQLConditionCriteria("AreaMasterType_ID",AreaMasterTypeID.STA_CONSO, SQLOperatorType.EQUALS),
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

                if (checkMin < checkMax)
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
    }
}
