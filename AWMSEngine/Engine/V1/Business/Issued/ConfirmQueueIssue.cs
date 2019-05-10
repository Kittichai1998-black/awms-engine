using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.ADO.QueueApi;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Criteria.SP.Request;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
namespace AWMSEngine.Engine.Business.Issued
{
    public class ConfirmQueueIssue : BaseEngine<ConfirmQueueIssue.TReq, ConfirmQueueIssue.TRes>
    {
        public class TReq
        {
            public List<DocumentProcess> DocumentProcessed;
            public class DocumentProcess
            {
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
        }

        public class TRes
        {
            public List<docItemStoageObject> dociSto;
            public class docItemStoageObject
            {
                public long docID;
                public long stoID;
                public string stoRootCode;
                public string stoCode;
                public decimal packQty;
            }
        }
        public class queueout
        {
            public long? queueID;
            public string desWarehouseCode;
            public string desAreaCode;
            public string desLocationCode;
            public int priority;
            public List<baseinfo> baseInfo;
        }
        public class baseinfo
        {
            public string baseCode;
            public List<packinfo> packInfos;
        }
        public class packinfo
        {
            public string skuCode;
            public decimal skuQty;
            public string lot;
            public string batch;
        }

        private ams_Warehouse _warehouseASRS;
        private ams_AreaMaster _areaASRS;

        protected override TRes ExecuteEngine(TReq reqVO)
        {
            var queueWorkQueue = new WCSQueueApi.TReq();
            var queueWorkQueueOut = new List<WCSQueueApi.TReq.queueout>();

            TRes res = new TRes();
            StorageObjectCriteria stoCriteria = new StorageObjectCriteria();

            var resultDocItemSto = reqVO.DocumentProcessed.GroupBy(n => new { n.stoi, n.dociID, n.baseCode, n.wareHouseID, n.areaID, n.priority })
                .Select(g => new
                {
                    g.Key.stoi,
                    g.Key.dociID,
                    g.Key.baseCode,
                    g.Key.wareHouseID,
                    g.Key.areaID,
                    g.Key.priority
                }).Where(x => x.stoi != null).ToList();

            foreach (var list in reqVO.DocumentProcessed.GroupBy(x=>new { baseCode = x.baseCode, stoi = x.stoi }))
            {
                if (list.Key.stoi != null)
                {
                    if(list.Select(x=>x.wareHouseID).Distinct().Count() > 1)
                    {
                        //throw
                    }
                    this._warehouseASRS = this.StaticValue.Warehouses.FirstOrDefault(x => x.ID == list.First().wareHouseID);
                    if (_warehouseASRS == null)
                        throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบ Warehouse Code '" + list.First().wareHouseID + "'");
                    this._areaASRS = this.StaticValue.AreaMasters.FirstOrDefault(x => x.ID == list.First().areaID && x.Warehouse_ID == _warehouseASRS.ID);
                    if (_areaASRS == null)
                        throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบ Area Code '" + list.First().areaID + "'");

                    var getRootSTO = ADO.StorageObjectADO.GetInstant().Get(list.Key.baseCode, list.First().wareHouseID, list.First().areaID, false, true, this.BuVO);

                    if (getRootSTO.eventStatus != StorageObjectEventStatus.RECEIVED)
                        throw new AMWException(this.Logger, AMWExceptionCode.B0001, "พาเลท " + getRootSTO.code + " ไม่อยู่ในสถานะพร้อมเบิก");

                    var stoPackID = ADO.StorageObjectADO.GetInstant().Get(list.Key.stoi.Value, StorageObjectType.BASE, false, true, this.BuVO).mapstos.Where(x => x.parentID == list.Key.stoi).Select(x => x.id).FirstOrDefault();

                    foreach(var docX in list.Select(x => new { x.dociID , x.docID, x.itemCode, x.qty, x.stoi})) { 

                        var docItem = ADO.DocumentADO.GetInstant().GetItemAndStoInDocItem(docX.dociID, this.BuVO);
                        var getSTO = getRootSTO.mapstos.Where(x => x.code == docX.itemCode).Select(x => x.id).FirstOrDefault();
                        /***********insert DocItemSto**********/
                        var unitConvert = StaticValue.ConvertToNewUnitBySKU(docItem.SKUMaster_ID.Value, docX.qty, getRootSTO.mapstos[0].baseUnitID, docItem.UnitType_ID.Value);
                        ADO.DocumentADO.GetInstant().CreateDocItemSto(docX.dociID, getRootSTO.mapstos.Where(x => x.parentID == docX.stoi).Select(x => x.id).FirstOrDefault().Value, unitConvert.qty, unitConvert.unitType_ID, unitConvert.baseQty, unitConvert.baseUnitType_ID, this.BuVO);
                        /***********update Document EventStatus 10 --> 11**********/
                        ADO.DocumentADO.GetInstant().UpdateStatusToChild(docX.docID, DocumentEventStatus.NEW, null, DocumentEventStatus.WORKING, this.BuVO);
                    }
                    /***********update StorageObject EventStatus 12 --> 17**********/
                    ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(list.Key.stoi ?? 0, StorageObjectEventStatus.RECEIVED, null, StorageObjectEventStatus.PICKING, this.BuVO);

                }
                else
                {
                }
            }

            var results = from element in resultDocItemSto
                          group element by element.baseCode
                  into groups
                      select groups.OrderBy(p => p.stoi).First();

            foreach (var result in results)
            {
                List<amt_DocumentItem> docItems = new List<amt_DocumentItem>();
                var docItem = ADO.DataADO.GetInstant().SelectBy<amt_DocumentItem>("amt_DocumentItem", "*", null,
                    new SQLConditionCriteria[]
                    {
                    new SQLConditionCriteria("ID", result.dociID, SQLOperatorType.EQUALS),
                    },
                    new SQLOrderByCriteria[] { }, null, null,
                    this.BuVO).FirstOrDefault();
                stoCriteria = ADO.StorageObjectADO.GetInstant().Get(result.baseCode, result.wareHouseID, result.areaID, false, true, this.BuVO);
                var getArea = this.StaticValue.AreaMasters.FirstOrDefault(x => x.ID == stoCriteria.areaID);
                docItems.Add(docItem);

                //create WorkQueue
                if (getArea.AreaMasterType_ID == Convert.ToInt16(AreaMasterTypeID.STORAGE_ASRS))
                {
                    
                    SPworkQueue workQ = CreateQIssue(docItems, stoCriteria, result.priority, DateTime.Now, stoCriteria.areaID.Value);
                    var baseInfo = new WCSQueueApi.TReq.queueout.baseinfo();
                    baseInfo = new WCSQueueApi.TReq.queueout.baseinfo()
                    {
                        baseCode = result.baseCode,
                        packInfos = null
                    };

                    queueWorkQueueOut.Add(new WCSQueueApi.TReq.queueout()
                    {
                        queueID = workQ.ID,
                        desWarehouseCode = _warehouseASRS.Code,
                        desAreaCode = _areaASRS.Code,
                        desLocationCode = null,
                        priority = result.priority,
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
                else
                {
                    throw new AMWException(this.Logger, AMWExceptionCode.B0001, "ไม่สามารถเบิกพาเลทสินค้าได้");
                }
            }
            /*****WCSQueueApi*****/
            var chkMachineASRS = this.StaticValue.GetConfig("RUN_MACHINE_ASRS");

            if (queueWorkQueue.queueOut != null && chkMachineASRS.ToUpper() == "TRUE")
            {
                var wcsAcceptRes = WCSQueueApi.GetInstant().SendQueue(queueWorkQueue, this.BuVO);
                if (wcsAcceptRes._result.resultcheck == 0)
                {
                    throw new AMWException(this.Logger, AMWExceptionCode.B0001, "ไม่สามารถเบิกพาเลทสินค้าจาก ASRS ได้");
                }
            }

            List<TRes.docItemStoageObject> DocItems = new List<TRes.docItemStoageObject>();
            res.dociSto = DocItems;

            CloseDocumentNotDisto(reqVO.DocumentProcessed.Select(x => x.docID).ToList());
            return res;
        }

        private SPworkQueue CreateQIssue(List<amt_DocumentItem> docItems, StorageObjectCriteria mapsto, int priority, DateTime actualTime, long souAreaID)
        {
            var souAreas = ADO.AreaADO.GetInstant().ListDestinationArea(IOType.OUTPUT, souAreaID, this.BuVO);
            var souAreaDefault = souAreas.OrderByDescending(x => x.DefaultFlag).FirstOrDefault();
            SPworkQueue res = new SPworkQueue();
            SPworkQueue workQ = new SPworkQueue()
            {
                ID = null,
                IOType = IOType.OUTPUT,
                ActualTime = actualTime,
                Parent_WorkQueue_ID = null,
                Priority = priority,
                TargetStartTime = null,

                StorageObject_ID = mapsto.id,
                StorageObject_Code = mapsto.code,

                Warehouse_ID = this.StaticValue.AreaMasters.First(x => x.ID == souAreaDefault.Sou_AreaMaster_ID).Warehouse_ID.Value,
                AreaMaster_ID = souAreaDefault.Sou_AreaMaster_ID.Value,
                AreaLocationMaster_ID = souAreaDefault.Sou_AreaLocationMaster_ID,

                Des_Warehouse_ID = _warehouseASRS.ID.Value,
                Des_AreaMaster_ID = _areaASRS.ID.Value,
                Des_AreaLocationMaster_ID = null,

                Sou_Warehouse_ID = this.StaticValue.AreaMasters.First(x => x.ID == souAreaDefault.Sou_AreaMaster_ID).Warehouse_ID.Value,
                Sou_AreaMaster_ID = souAreaDefault.Sou_AreaMaster_ID.Value,
                Sou_AreaLocationMaster_ID = souAreaDefault.Sou_AreaLocationMaster_ID,

                EventStatus = WorkQueueEventStatus.IDLE,
                Status = EntityStatus.INACTIVE,
                StartTime = actualTime,
                DocumentItemWorkQueues = Common.ConverterModel.ToDocumentItemWorkQueue(docItems, mapsto)
            };

            res = ADO.WorkQueueADO.GetInstant().Create(workQ, this.BuVO);

            return res;
        }
        public void CloseDocumentNotDisto(List<long> docIDs)
        {
            docIDs = docIDs.Distinct().ToList();
            var docs = ADO.DocumentADO.GetInstant().ListAndItem(docIDs, this.BuVO);
            docs.ForEach(doc =>
            {
                doc.DocumentItems.ForEach(doci =>
                {
                    var countInactive = ADO.DataADO.GetInstant().CountBy<amt_DocumentItemStorageObject>(
                        new SQLConditionCriteria[]
                        {
                            new SQLConditionCriteria("documentItem_ID",doci.ID.Value, SQLOperatorType.EQUALS),
                            new SQLConditionCriteria("status",EntityStatus.INACTIVE, SQLOperatorType.EQUALS)
                        }, this.BuVO);
                    if (countInactive == 0)
                    {
                        doci.EventStatus = DocumentEventStatus.WORKED;
                        doci.Status = ADO.DocumentADO.GetInstant().UpdateItemEventStatus(doci.ID.Value, DocumentEventStatus.WORKED, this.BuVO);
                    }
                });
                if (doc.DocumentItems.TrueForAll(x => x.EventStatus == DocumentEventStatus.WORKED))
                {
                    
                    ADO.DocumentADO.GetInstant().UpdateStatusToChild(doc.ID.Value, null, EntityStatus.ACTIVE, DocumentEventStatus.WORKED, this.BuVO);
                    new ClosedGIDocument().Execute(this.Logger, this.BuVO, new ClosedGIDocument.TDocReq() { docIDs = new long[] { doc.ID.Value } });
                }
                else{
                    ADO.DocumentADO.GetInstant().UpdateEventStatus(doc.ID.Value, DocumentEventStatus.WORKING,this.BuVO);
                }
            });
        }
    }
}
