using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Criteria.SP.Response;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWMSModel.Criteria.SP.Request;
using AWMSEngine.ADO.QueueApi;

namespace AWMSEngine.Engine.Business.Issued
{
    public class ProcessQueueIssue : BaseEngine<ProcessQueueIssue.TReq, ProcessQueueIssue.TRes>
    {
        public class TReq
        {
            public List<Document> documentsProcess;
            public DateTime actualTime;
            public class Document
            {
                public long docID;
                public List<DocumentItem> items;
                public class DocumentItem
                {
                    public long docItemID;
                    public string itemCode;
                    public string refID;
                    public int pickOrderType;//0=FIFO,1=LIFO
                    public string orderBy;//ชื่อ Field สำหรับ order by
                    public List<Batch> batchs;
                    public string orderNo;
                    public string lot;//Stamp Date
                    public int priority;
                    public class Batch
                    {
                        public string value;
                        public decimal qty;
                    }
                }
            }
        }

        public class TRes
        {
            public List<DocumentProcess> DocumentProcessed;
        }

        public class items
        {
            public string itemCode;
            public int pickOrderType;
            public string orderBy;
            public string orderNo;
            public string lot;
            public int priority;
            public string batch;
            public decimal qty;
        }

        public class DocumentProcess
        {
            public amt_Document document;
            public amv_DocumentItem documentItem;
            public StorageObjectCriteria stoPack;
            public long docID;
            public string docCode;
            public long dociID;
            public long? stoi;
            public string itemCode;
            public decimal qty;
            public string batch;
            public string orderNo;
            public string lot;
            public int priority;
            public long? wareHouseID;
            public long? areaID;
            public string baseCode;
            public decimal? stoBaseQty;
        }

        private ams_Warehouse _warehouseASRS;
        private ams_AreaMaster _areaASRS;

        protected override TRes ExecuteEngine(TReq reqVO)
        {
            TRes res = new TRes();
            var queueWorkQueue = new WCSQueueApi.TReq();
            var queueWorkQueueOut = new List<WCSQueueApi.TReq.queueout>();
            List<SPOutSTOProcesQueueIssue> stoRoot = new List<SPOutSTOProcesQueueIssue>();
            List<amt_DocumentItem> docItems = new List<amt_DocumentItem>();
            DocumentEventStatus[] DocEventStatuses = new DocumentEventStatus[] { DocumentEventStatus.IDLE, DocumentEventStatus.WORKING };

            List<items> listItems = new List<items>();
            List<DocumentProcess> listDocProcessed = new List<DocumentProcess>();

            foreach (var docsProcess in reqVO.documentsProcess)
            {
                var doc = ADO.DataADO.GetInstant().SelectBy<amv_Document>("amv_Document", "ID,ParentDocument_ID,code", null,
                new SQLConditionCriteria[]
                {
                    new SQLConditionCriteria("ID", docsProcess.docID, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("DocumentType_ID", DocumentTypeID.GOODS_ISSUED, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("EventStatus",DocEventStatuses, SQLOperatorType.IN)
                },
                new SQLOrderByCriteria[] { }, null, null,
                this.BuVO).FirstOrDefault();

                if (doc == null)
                    throw new AMWException(this.Logger, AMWExceptionCode.V2001, "ไม่พบเอกสารในระบบ");

                foreach (var docItemsProcess in docsProcess.items)
                {
                    var docItem = ADO.DataADO.GetInstant().SelectBy<amv_Document>("amv_DocumentItem", "*", null,
                    new SQLConditionCriteria[]
                    {
                    new SQLConditionCriteria("ID", docItemsProcess.docItemID, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("Document_ID", docsProcess.docID, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("EventStatus",DocEventStatuses, SQLOperatorType.IN)
                    },
                    new SQLOrderByCriteria[] { }, null, null,
                    this.BuVO).FirstOrDefault();
                    if (docItem == null)
                        throw new AMWException(this.Logger, AMWExceptionCode.V2001, "ไม่พบรายละเอียดของเอกสารในระบบ");

                    foreach (var batch in docItemsProcess.batchs)
                    {
                        decimal qtQty = listItems.Where(x => x.itemCode == docItemsProcess.itemCode &&
                            x.pickOrderType == docItemsProcess.pickOrderType &&
                            x.orderBy == docItemsProcess.orderBy &&
                            x.orderNo == docItemsProcess.orderNo &&
                            x.lot == docItemsProcess.lot &&
                            x.priority == docItemsProcess.priority &&
                            x.batch == batch.value)
                            .Sum(x => x.qty);

                        if (qtQty == 0)
                        {
                            listItems.Add(new items
                            {
                                itemCode = docItemsProcess.itemCode,
                                pickOrderType = docItemsProcess.pickOrderType,
                                orderBy = docItemsProcess.orderBy,
                                orderNo = docItemsProcess.orderNo,
                                lot = docItemsProcess.lot,
                                priority = docItemsProcess.priority,
                                batch = batch.value,
                                qty = batch.qty
                            });
                        }
                        else
                        {
                            foreach (var item in listItems.Where(x => x.itemCode == docItemsProcess.itemCode && x.batch == batch.value))
                            {
                                item.qty = item.qty + qtQty;
                            }
                        }
                    }
                }
            }

            foreach (var item in listItems)
            {
                stoRoot = ADO.StorageObjectADO.GetInstant().StoProcessQueue(
                item.itemCode,
                item.pickOrderType,
                item.orderBy,
                item.lot,
                item.orderNo,
                this.BuVO);

                foreach (var doc in reqVO.documentsProcess)
                {
                    var document = ADO.DataADO.GetInstant().SelectBy<amt_Document>("amt_Document", "ID,ParentDocument_ID,code,RefID", null,
                    new SQLConditionCriteria[]
                    {
                        new SQLConditionCriteria("ID", doc.docID, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("DocumentType_ID", DocumentTypeID.GOODS_ISSUED, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("EventStatus",DocEventStatuses, SQLOperatorType.IN)
                    },
                    new SQLOrderByCriteria[] { }, null, null,
                    this.BuVO).FirstOrDefault();

                    foreach (var docItem in doc.items.Where(x => x.itemCode == item.itemCode))
                    {
                        var documentItem = ADO.DataADO.GetInstant().SelectBy<amv_DocumentItem>("amv_DocumentItem", "*", null,
                        new SQLConditionCriteria[]
                        {
                            new SQLConditionCriteria("ID", docItem.docItemID, SQLOperatorType.EQUALS),
                            new SQLConditionCriteria("EventStatus",DocEventStatuses, SQLOperatorType.IN)
                        },
                        new SQLOrderByCriteria[] { }, null, null,
                        this.BuVO).FirstOrDefault();

                        foreach (var batch in docItem.batchs)
                        {
                            if (stoRoot.Count > 0)
                            {
                                foreach (var sto in stoRoot.Where(x => ((x.batch == batch.value) || (batch.value == null || batch.value == "")) && x.packQty > 0))
                                {
                                    if (sto.evtStatus == Convert.ToInt16(StorageObjectEventStatus.RECEIVED))
                                    {
                                        var stoPack = ADO.StorageObjectADO.GetInstant().Get(sto.code, null, null, false, true, this.BuVO);
                                        
                                        if (batch.qty > 0)
                                        {
                                            if (sto.packQty >= batch.qty)
                                            {
                                                listDocProcessed.Add(new DocumentProcess
                                                {
                                                    docID = doc.docID,
                                                    document = document,
                                                    documentItem = documentItem,
                                                    stoPack = stoPack.ToTreeList().Where(x => x.code == docItem.itemCode).FirstOrDefault(),
                                                    docCode = document.Code,
                                                    dociID = docItem.docItemID,
                                                    stoi = sto.id,
                                                    itemCode = docItem.itemCode,
                                                    qty = batch.qty,
                                                    batch = batch.value,
                                                    orderNo = sto.orderNo,
                                                    lot = sto.lot,
                                                    priority = docItem.priority,
                                                    wareHouseID = sto.warehouseID,
                                                    areaID = sto.areaID,
                                                    baseCode = sto.rootCode,
                                                    stoBaseQty = sto.packQty

                                                });
                                                sto.packQty = sto.packQty - batch.qty;
                                                batch.qty = 0;
                                            }
                                            else
                                            {
                                                listDocProcessed.Add(new DocumentProcess
                                                {
                                                    docID = doc.docID,
                                                    document = document,
                                                    documentItem = documentItem,
                                                    stoPack = stoPack.ToTreeList().Where(x => x.code == docItem.itemCode).FirstOrDefault(),
                                                    docCode = document.Code,
                                                    dociID = docItem.docItemID,
                                                    stoi = sto.id,
                                                    itemCode = docItem.itemCode,
                                                    qty = sto.packQty,
                                                    batch = batch.value,
                                                    orderNo = sto.orderNo,
                                                    lot = sto.lot,
                                                    priority = docItem.priority,
                                                    wareHouseID = sto.warehouseID,
                                                    areaID = sto.areaID,
                                                    baseCode = sto.rootCode,
                                                    stoBaseQty = sto.packQty
                                                });
                                                batch.qty = batch.qty - sto.packQty;
                                                sto.packQty = (sto.packQty - item.qty) < 0 ? 0 : (sto.packQty - item.qty);
                                            }
                                        }
                                        else
                                        {
                                            break;
                                        }
                                    }
                                }
                                if (batch.qty > 0)
                                {
                                    var stoNotReceived = stoRoot.Where(x => ((x.batch == batch.value) || (batch.value == null)) && x.packQty > 0 && x.evtStatus != 12);
                                    foreach (var sto in stoNotReceived)
                                    {
                                        var stoPackID = ADO.StorageObjectADO.GetInstant().Get(sto.code, null, null, false, true, this.BuVO).ToTreeList().Where(x => x.code == docItem.itemCode).FirstOrDefault();
                                        var listDociSTO = ADO.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>("amt_DocumentItemStorageObject", "*", null,
                                            new SQLConditionCriteria[]
                                            {
                                            new SQLConditionCriteria("StorageObject_ID",stoPackID.id,SQLOperatorType.EQUALS),
                                            new SQLConditionCriteria("Status",EntityStatus.INACTIVE, SQLOperatorType.EQUALS)
                                            },
                                            new SQLOrderByCriteria[] { }, null, null, this.BuVO);
                                        var sumQty = listDociSTO.Sum(x => x.BaseQuantity);
                                        stoPackID.baseQty = stoPackID.baseQty - sumQty.Value;
                                        if (stoPackID.baseQty > 0)
                                        {
                                            throw new AMWException(this.Logger, AMWExceptionCode.V2001, docItem.itemCode + " ไม่อยู่ในสถานะพร้อมประมวลผล");
                                        }
                                    }
                                }
                                
                            }
                            else
                            {
                                listDocProcessed.Add(new DocumentProcess
                                {
                                    docID = doc.docID,
                                    document = document,
                                    documentItem = documentItem,
                                    stoPack = null,
                                    docCode = document.Code,
                                    dociID = docItem.docItemID,
                                    stoi = null,
                                    itemCode = docItem.itemCode,
                                    qty = batch.qty,
                                    batch = batch.value,
                                    orderNo = null,
                                    lot = null,
                                    priority = docItem.priority,
                                    wareHouseID = null,
                                    areaID = null,
                                    baseCode = null,
                                    stoBaseQty = null
                                });
                            }
                        }
                        if (listDocProcessed.Where(x => x.dociID == docItem.docItemID).Count() == 0)
                        {
                            listDocProcessed.Add(new DocumentProcess
                            {
                                docID = doc.docID,
                                document = document,
                                documentItem = documentItem,
                                stoPack = null,
                                docCode = document.Code,
                                dociID = docItem.docItemID,
                                stoi = null,
                                itemCode = docItem.itemCode,
                                qty = 0,
                                batch = null,
                                orderNo = null,
                                lot = null,
                                priority = docItem.priority,
                                wareHouseID = null,
                                areaID = null,
                                baseCode = null,
                                stoBaseQty = null
                            });
                        }
                    }
                }
            }

            foreach (var processed in listDocProcessed.Where(w => w.areaID==5))
            {
                this._warehouseASRS = this.StaticValue.Warehouses.FirstOrDefault(x => x.ID == processed.wareHouseID);
                if (_warehouseASRS == null)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบ Warehouse Code '" + processed.wareHouseID + "'");
                this._areaASRS = this.StaticValue.AreaMasters.FirstOrDefault(x => x.ID == processed.areaID && x.Warehouse_ID == _warehouseASRS.ID);
                if (_areaASRS == null)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบ Area Code '" + processed.areaID + "'");

                if (this.StaticValue.AreaMasters.FirstOrDefault(x => x.ID == processed.areaID).AreaMasterType_ID == Convert.ToInt16(AreaMasterTypeID.STORAGE_ASRS))
                {
                    var baseInfo = new WCSQueueApi.TReq.queueout.baseinfo();
                    baseInfo = new WCSQueueApi.TReq.queueout.baseinfo()
                    {
                        baseCode = processed.baseCode,
                        packInfos = null
                    };
                    queueWorkQueueOut.Add(new WCSQueueApi.TReq.queueout()
                    {
                        queueID = null,
                        desWarehouseCode = _warehouseASRS.Code,
                        desAreaCode = _areaASRS.Code,
                        desLocationCode = null,
                        priority = processed.priority,
                        baseInfo = baseInfo,
                    });
                }
            }
            foreach (var checkBaseInfo in queueWorkQueueOut)
            {
                if (checkBaseInfo.baseInfo.baseCode != null)
                {
                    queueWorkQueue.queueOut = queueWorkQueueOut;
                    
                }
            }
            var chkMachineASRS = this.StaticValue.GetConfig("RUN_MACHINE_ASRS");

            if (queueWorkQueue.queueOut != null && chkMachineASRS.ToUpper() == "TRUE")
            {
                var wcsAcceptRes = WCSQueueApi.GetInstant().SendQueue(queueWorkQueue, this.BuVO);
                if (wcsAcceptRes._result.resultcheck == 0)
                {
                    throw new AMWException(this.Logger, AMWExceptionCode.B0001, "ไม่สามารถเบิกพาเลทสินค้าได้");
                }
            }
            res.DocumentProcessed = listDocProcessed;
            return res;
        }
    }
}
