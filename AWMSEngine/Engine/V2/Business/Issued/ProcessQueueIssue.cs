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

namespace AWMSEngine.Engine.V2.Business.Issued
{
    public class ProcessQueueIssue : BaseEngine<ProcessQueueIssue.TReq, ProcessQueueIssue.TRes>
    {
        public class TReq
        {
            public List<Document> documentsProcess;
            public DateTime actualTime;
            public bool is_reject;
            public class Document
            {
                public long docID;
                public List<DocumentItem> docItems;
                public class DocumentItem
                {
                    public long docItemID;
                    public string skuCode;
                    public string baseCode;
                    public string areaLocationCode;
                    public List<Condition> conditions;
                    public List<OrderBy> orderBys;
                    public bool shelfLife;
                    public bool expireDate;
                    public bool incubateDate;
                    public bool fullPallet;
                    public StorageObjectEventStatus evtStatus;
                    public decimal qty;
                    public int percentRandom;
                    public int priority;
                    public class Condition
                    {
                        public string batch;
                        public string lot;
                        public string orderNo;
                        public string ref1;
                        public string ref2;
                        public string refID;
                        public decimal qty;
                    }
                    public class OrderBy
                    {
                        public string columnName;
                        public int orderByType = 0;//0=DESC,1=ASC
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
            public string skuCode;
            public string baseCode;
            public string areaLocationCode;
            public string batch;
            public string lot;
            public string orderNo;
            public string ref1;
            public string ref2;
            public string refID;
            public decimal qty;
            public string orderBys;
            public int priority;
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
            var queueWorkQueue = new WCSQueueADO.TReq();
            var queueWorkQueueOut = new List<WCSQueueADO.TReq.queueout>();
            List<SPOutSTOProcesQueueIssue> stoRoot = new List<SPOutSTOProcesQueueIssue>();
            List<amt_DocumentItem> docItems = new List<amt_DocumentItem>();
            DocumentEventStatus[] DocEventStatuses = new DocumentEventStatus[] { DocumentEventStatus.NEW, DocumentEventStatus.WORKING };

            List<items> listItems = new List<items>();
            List<items> listGroupItems = new List<items>();
            List<DocumentProcess> listDocProcessed = new List<DocumentProcess>();

            foreach (var docsProcess in reqVO.documentsProcess)
            {
                var doc = ADO.DataADO.GetInstant().SelectBy<amt_Document>("amt_Document", "ID,ParentDocument_ID,code", null,
                new SQLConditionCriteria[]
                {
                    new SQLConditionCriteria("ID", docsProcess.docID, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("DocumentType_ID", DocumentTypeID.GOODS_ISSUED, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("EventStatus",DocEventStatuses, SQLOperatorType.IN)
                },
                new SQLOrderByCriteria[] { }, null, null,
                this.BuVO).FirstOrDefault();

                if (doc == null)
                    throw new AMWException(this.Logger, AMWExceptionCode.V2001, "Document Not Found");

                foreach (var docItemsProcess in docsProcess.docItems)
                {
                    var docItem = ADO.DataADO.GetInstant().SelectBy<amt_Document>("amt_DocumentItem", "*", null,
                    new SQLConditionCriteria[]
                    {
                    new SQLConditionCriteria("ID", docItemsProcess.docItemID, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("Document_ID", docsProcess.docID, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("EventStatus",DocEventStatuses, SQLOperatorType.IN)
                    },
                    new SQLOrderByCriteria[] { }, null, null,
                    this.BuVO).FirstOrDefault();
                    if (docItem == null)
                        throw new AMWException(this.Logger, AMWExceptionCode.V2001, "Document Item Not Found");

                    var strOrderBy = string.Join(",", docItemsProcess.orderBys.Select(y => y.columnName + " " + (y.orderByType == 0 ? "DESC" : "ASC")).ToArray());
                    foreach (var condition in docItemsProcess.conditions)
                    {
                        
                        listItems.Add(new items
                        {
                            skuCode = docItemsProcess.skuCode,
                            baseCode = docItemsProcess.baseCode,
                            areaLocationCode = docItemsProcess.areaLocationCode,
                            batch = condition.batch,
                            lot = condition.lot,
                            orderNo = condition.orderNo,
                            ref1 = condition.ref1,
                            ref2 = condition.ref2,
                            refID = condition.refID,
                            qty = condition.qty,
                            orderBys = strOrderBy,
                            priority = docItemsProcess.priority
                        });
                    }   
                }
                listGroupItems = listItems.GroupBy(d => new {
                    d.skuCode,
                    d.baseCode,
                    d.areaLocationCode,
                    d.batch,
                    d.lot,
                    d.orderNo,
                    d.ref1,
                    d.ref2,
                    d.refID,
                    d.orderBys,
                    d.priority
                }).Select(g => new items
                {
                    skuCode = g.Key.skuCode,
                    baseCode = g.Key.baseCode,
                    areaLocationCode = g.Key.areaLocationCode,
                    batch = g.Key.batch,
                    lot = g.Key.lot,
                    orderNo = g.Key.orderNo,
                    ref1 = g.Key.ref1,
                    ref2 = g.Key.ref2,
                    refID = g.Key.refID,
                    orderBys = g.Key.orderBys,
                    priority = g.Key.priority,
                    qty = g.Sum(e => e.qty)
                }).ToList();
            }

            foreach (var item in listGroupItems)
            {
                //stoRoot = ADO.StorageObjectADO.GetInstant().StoProcessQueue(
                //item.itemCode,
                //item.pickOrderType,
                //item.orderBy,
                //item.lot,
                //item.orderNo,
                //this.BuVO);
                //if(listDocProcessed.Count > 0)
                //{
                //    stoRoot = stoRoot.Where(x => !listDocProcessed.Any(y => y.stoi == x.id)).ToList();
                //}

                //foreach (var doc in reqVO.documentsProcess)
                //{
                //    var document = ADO.DataADO.GetInstant().SelectBy<amt_Document>("amt_Document", "ID,ParentDocument_ID,code,RefID", null,
                //    new SQLConditionCriteria[]
                //    {
                //        new SQLConditionCriteria("ID", doc.docID, SQLOperatorType.EQUALS),
                //        new SQLConditionCriteria("DocumentType_ID", DocumentTypeID.GOODS_ISSUED, SQLOperatorType.EQUALS),
                //        new SQLConditionCriteria("EventStatus",DocEventStatuses, SQLOperatorType.IN)
                //    },
                //    new SQLOrderByCriteria[] { }, null, null,
                //    this.BuVO).FirstOrDefault();

                //    foreach (var docItem in doc.docItems.Where(x => x.skuCode == item.itemCode))
                //    {
                //        var documentItem = ADO.DataADO.GetInstant().SelectBy<amv_DocumentItem>("amv_DocumentItem", "*", null,
                //        new SQLConditionCriteria[]
                //        {
                //            new SQLConditionCriteria("ID", docItem.docItemID, SQLOperatorType.EQUALS),
                //            new SQLConditionCriteria("EventStatus",DocEventStatuses, SQLOperatorType.IN)
                //        },
                //        new SQLOrderByCriteria[] { }, null, null,
                //        this.BuVO).FirstOrDefault();

                //        //foreach (var batch in docItem.batchs)
                //        //{
                //        //    if (stoRoot.Count > 0)
                //        //    {
                //        //        foreach (var sto in stoRoot.Where(x => ((x.batch == batch.value) || (batch.value == null || batch.value == "")) 
                //        //        && x.packQty > 0))
                //        //        {
                //        //            if (sto.evtStatus == Convert.ToInt16(StorageObjectEventStatus.RECEIVED))
                //        //            {
                //        //                var stoPack = ADO.StorageObjectADO.GetInstant().Get(sto.code, null, null, false, true, this.BuVO);
                //        //                if (batch.qty > 0)
                //        //                {
                //        //                    if (sto.packQty >= batch.qty)
                //        //                    {
                //        //                        listDocProcessed.Add(new DocumentProcess
                //        //                        {
                //        //                            docID = doc.docID,
                //        //                            document = document,
                //        //                            documentItem = documentItem,
                //        //                            stoPack = stoPack.ToTreeList().Where(x => x.code == docItem.itemCode).FirstOrDefault(),
                //        //                            docCode = document.Code,
                //        //                            dociID = docItem.docItemID,
                //        //                            stoi = sto.id,
                //        //                            itemCode = docItem.itemCode,
                //        //                            qty = batch.qty,
                //        //                            batch = batch.value,
                //        //                            orderNo = sto.orderNo,
                //        //                            lot = sto.lot,
                //        //                            priority = docItem.priority,
                //        //                            wareHouseID = sto.warehouseID,
                //        //                            areaID = sto.areaID,
                //        //                            baseCode = sto.rootCode,
                //        //                            stoBaseQty = sto.packQty

                //        //                        });
                                                
                //        //                        sto.packQty = sto.packQty - batch.qty;
                //        //                        batch.qty = 0;
                //        //                    }
                //        //                    else
                //        //                    {
                //        //                        listDocProcessed.Add(new DocumentProcess
                //        //                        {
                //        //                            docID = doc.docID,
                //        //                            document = document,
                //        //                            documentItem = documentItem,
                //        //                            stoPack = stoPack.ToTreeList().Where(x => x.code == docItem.itemCode).FirstOrDefault(),
                //        //                            docCode = document.Code,
                //        //                            dociID = docItem.docItemID,
                //        //                            stoi = sto.id,
                //        //                            itemCode = docItem.itemCode,
                //        //                            qty = sto.packQty,
                //        //                            batch = batch.value,
                //        //                            orderNo = sto.orderNo,
                //        //                            lot = sto.lot,
                //        //                            priority = docItem.priority,
                //        //                            wareHouseID = sto.warehouseID,
                //        //                            areaID = sto.areaID,
                //        //                            baseCode = sto.rootCode,
                //        //                            stoBaseQty = sto.packQty
                //        //                        });
                //        //                        batch.qty = batch.qty - sto.packQty;
                //        //                        sto.packQty = (sto.packQty - item.qty) < 0 ? 0 : (sto.packQty - item.qty);
                //        //                    }
                //        //                }
                //        //                else
                //        //                {
                //        //                    break;
                //        //                }
                //        //            }
                //        //        }
                //        //        if (batch.qty > 0)
                //        //        {
                //        //            var stoNotReceived = stoRoot.Where(x => ((x.batch == batch.value) || (batch.value == null)) && x.packQty > 0 && x.evtStatus != 12);
                //        //            foreach (var sto in stoNotReceived)
                //        //            {
                //        //                var stoPackID = ADO.StorageObjectADO.GetInstant().Get(sto.code, null, null, false, true, this.BuVO).ToTreeList().Where(x => x.code == docItem.itemCode).FirstOrDefault();
                //        //                var listDociSTO = ADO.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>("amt_DocumentItemStorageObject", "*", null,
                //        //                    new SQLConditionCriteria[]
                //        //                    {
                //        //                    new SQLConditionCriteria("StorageObject_ID",stoPackID.id,SQLOperatorType.EQUALS),
                //        //                    new SQLConditionCriteria("Status",EntityStatus.INACTIVE, SQLOperatorType.EQUALS)
                //        //                    },
                //        //                    new SQLOrderByCriteria[] { }, null, null, this.BuVO);
                //        //                var sumQty = listDociSTO.Sum(x => x.BaseQuantity);
                //        //                stoPackID.baseQty = stoPackID.baseQty - sumQty.Value;
                //        //                if (stoPackID.baseQty > 0)
                //        //                {
                //        //                    throw new AMWException(this.Logger, AMWExceptionCode.V2001, docItem.itemCode + " ไม่อยู่ในสถานะพร้อมประมวลผล");
                //        //                }
                //        //            }
                //        //        }
                //        //    }
                //        //    else
                //        //    {
                //        //        listDocProcessed.Add(new DocumentProcess
                //        //        {
                //        //            docID = doc.docID,
                //        //            document = document,
                //        //            documentItem = documentItem,
                //        //            stoPack = null,
                //        //            docCode = document.Code,
                //        //            dociID = docItem.docItemID,
                //        //            stoi = null,
                //        //            itemCode = docItem.itemCode,
                //        //            qty = batch.qty,
                //        //            batch = batch.value,
                //        //            orderNo = null,
                //        //            lot = null,
                //        //            priority = docItem.priority,
                //        //            wareHouseID = null,
                //        //            areaID = null,
                //        //            baseCode = null,
                //        //            stoBaseQty = null
                //        //        });
                //        //    }
                //        //}
                //        //if (listDocProcessed.Where(x => x.dociID == docItem.docItemID).Count() == 0)
                //        //{
                //        //    listDocProcessed.Add(new DocumentProcess
                //        //    {
                //        //        docID = doc.docID,
                //        //        document = document,
                //        //        documentItem = documentItem,
                //        //        stoPack = null,
                //        //        docCode = document.Code,
                //        //        dociID = docItem.docItemID,
                //        //        stoi = null,
                //        //        itemCode = docItem.itemCode,
                //        //        qty = 0,
                //        //        batch = null,
                //        //        orderNo = null,
                //        //        lot = null,
                //        //        priority = docItem.priority,
                //        //        wareHouseID = null,
                //        //        areaID = null,
                //        //        baseCode = null,
                //        //        stoBaseQty = null
                //        //    });
                //        //}
                //    }
                //}
            }

            foreach (var processed in listDocProcessed.Where(w => w.areaID==5))
            {
                this._warehouseASRS = this.StaticValue.Warehouses.FirstOrDefault(x => x.ID == processed.wareHouseID);
                if (_warehouseASRS == null)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบ Warehouse Code '" + processed.wareHouseID + "'");
                this._areaASRS = this.StaticValue.AreaMasters.FirstOrDefault(x => x.ID == processed.areaID && x.Warehouse_ID == _warehouseASRS.ID);
                if (_areaASRS == null)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบ Area Code '" + processed.areaID + "'");

                if (this.StaticValue.AreaMasters.FirstOrDefault(x => x.ID == processed.areaID).AreaMasterType_ID == AreaMasterTypeID.STORAGE_ASRS)
                {
                    var baseInfo = new WCSQueueADO.TReq.queueout.baseinfo();
                    baseInfo = new WCSQueueADO.TReq.queueout.baseinfo()
                    {
                        baseCode = processed.baseCode,
                        packInfos = null
                    };
                    queueWorkQueueOut.Add(new WCSQueueADO.TReq.queueout()
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
            var chkMachineASRS = this.StaticValue.GetConfigValue("RUN_MACHINE_ASRS");

            if (queueWorkQueue.queueOut != null && chkMachineASRS.ToUpper() == "TRUE")
            {
                var wcsAcceptRes = WCSQueueADO.GetInstant().SendQueue(queueWorkQueue, this.BuVO);
                if (wcsAcceptRes._result.resultcheck == 0)
                {
                    throw new AMWException(this.Logger, AMWExceptionCode.B0001, "ไม่สามารถเบิกพาเลทสินค้าได้");
                }
            }
            res.DocumentProcessed = listDocProcessed.OrderBy(x => x.docID).ToList();
            return res;
        }
    }
}
