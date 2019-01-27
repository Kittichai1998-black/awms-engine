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
                public long stoi;
                public string itemCode;
                public decimal qty;
                public string batch;
                public string orderNo;
                public string lot;
                public int priority;
                public long wareHouseID;
                public long areaID;
                public string baseCode;
                public decimal stoBaseQty;
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
            var xx = new WCSQueueApi.TReq();

            TRes res = new TRes();
            WCSQueueApi.TReq qOut = new WCSQueueApi.TReq();
            StorageObjectCriteria stoCriteria = new StorageObjectCriteria();
            foreach (var list in reqVO.DocumentProcessed)
            {
                this._warehouseASRS = this.StaticValue.Warehouses.FirstOrDefault(x => x.ID == list.wareHouseID);
                if (_warehouseASRS == null)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบ Warehouse Code '" + list.wareHouseID + "'");
                this._areaASRS = this.StaticValue.AreaMasters.FirstOrDefault(x => x.ID == list.areaID && x.Warehouse_ID == _warehouseASRS.ID);
                if (_areaASRS == null)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบ Area Code '" + list.areaID + "'");

                //update Document EventStatus 10 --> 11
                ADO.DocumentADO.GetInstant().UpdateStatusToChild(list.docID, DocumentEventStatus.IDLE, null, DocumentEventStatus.WORKING, this.BuVO);
                //update StorageObject EventStatus 12 --> 17
                ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(list.stoi, null, null, StorageObjectEventStatus.PICKING, this.BuVO);

                var getRootSTO = ADO.StorageObjectADO.GetInstant().Get(list.baseCode, list.wareHouseID, list.areaID, false, true, this.BuVO);
                var stoPackID = ADO.StorageObjectADO.GetInstant().Get(list.stoi, StorageObjectType.BASE, false, true, this.BuVO).mapstos.Where(x => x.parentID == list.stoi).Select(x => x.id).FirstOrDefault();

                var getSTO = getRootSTO.mapstos.Where(x => x.code == list.itemCode).Select(x => x.id).FirstOrDefault();
                //insert DocItemSto
                ADO.DocumentADO.GetInstant().CreateDocItemSto(list.dociID, stoPackID ?? 0, list.qty, getRootSTO.mapstos[0].unitID, list.qty, getRootSTO.mapstos[0].baseUnitID, this.BuVO);
            }
            var resultDocItemSto = reqVO.DocumentProcessed.GroupBy(n => new { n.stoi, n.dociID, n.baseCode, n.wareHouseID, n.areaID, n.priority })
                .Select(g => new
                {
                    g.Key.stoi,
                    g.Key.dociID,
                    g.Key.baseCode,
                    g.Key.wareHouseID,
                    g.Key.areaID,
                    g.Key.priority
                }).ToList();
            foreach (var result in resultDocItemSto)
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
                docItems.Add(docItem);
                //create WorkQueue
                SPworkQueue xyz = CreateQIssue(docItems, stoCriteria, 1, DateTime.Today, stoCriteria.areaID);
              
            }

            //WCSQueueApi.GetInstant().SendQueue(qOut, this.BuVO);

            List<TRes.docItemStoageObject> DocItems = new List<TRes.docItemStoageObject>();
            res.dociSto = DocItems;
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
                Status = EntityStatus.ACTIVE,
                StartTime = actualTime,
                DocumentItemWorkQueues = Common.ConverterModel.ToDocumentItemWorkQueue(docItems, mapsto)
            };

            res = ADO.WorkQueueADO.GetInstant().Create(workQ, this.BuVO);

            return res;
        }
    }
}
