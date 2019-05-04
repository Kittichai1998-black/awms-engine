using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Criteria.SP.Request;
using AWMSModel.Criteria.SP.Response;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business.Auditor
{
    public class GetWorkQueueAudit : BaseEngine<GetWorkQueueAudit.TReq, GetWorkQueueAudit.TRes>
    {
        public class TReq
        {
            public long docID;
            public long? warehouseID;
            public int priority;
            public long? desAreaID;
            public decimal percent;
            public int auditType;
        }

        public class TRes
        {
            public long docID;
            public List<WorkQueue> workQueue;
            public List<amt_DocumentItemStorageObject> disto;
        }

        public class WorkQueue : SPworkQueue
        {
            public long docItemID;
            public bool QueueStatus;
        }

        protected override TRes ExecuteEngine(TReq reqVO)
        {
            TRes listQueue = new TRes();
            List<WorkQueue> listWorkQueue = new List<WorkQueue>();
            var distoIni = new List<amt_DocumentItemStorageObject>();

            var desAreaID = this.StaticValue.AreaMasters.First(x => x.ID == reqVO.desAreaID.Value);
            var docItems = ADO.DocumentADO.GetInstant().ListItem(reqVO.docID, this.BuVO);

            foreach(var docItem in docItems)
            {
                var stoList = ADO.DocumentADO.GetInstant().getSTOList(docItem.ID.Value, this.BuVO);
                //if (stoList.Count == 0)
                //    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่มีสินค้าสำหรับ PI ในคลังสินค้า");
                var palletList = stoList.GroupBy(x => new { x.ParentStorageObject_ID }).Select(g => g.Key.ParentStorageObject_ID).ToList();

                foreach(var palletID in palletList)
                {
                    var mapsto = ADO.StorageObjectADO.GetInstant().Get(palletID.Value, StorageObjectType.BASE, false, true, this.BuVO);
                    listWorkQueue.Add(new WorkQueue()
                    {
                        ID = null,
                        IOType = IOType.OUTPUT,
                        ActualTime = DateTime.Now,
                        Parent_WorkQueue_ID = null,
                        Priority = reqVO.priority,
                        TargetStartTime = null,

                        StorageObject_ID = mapsto.id,
                        StorageObject_Code = mapsto.code,

                        Warehouse_ID = reqVO.warehouseID.Value,
                        AreaMaster_ID = mapsto.areaID,
                        AreaLocationMaster_ID = mapsto.parentID,

                        Sou_Warehouse_ID = reqVO.warehouseID.Value,
                        Sou_AreaMaster_ID = mapsto.areaID,
                        Sou_AreaLocationMaster_ID = mapsto.parentID,

                        Des_Warehouse_ID = desAreaID.Warehouse_ID.Value,
                        Des_AreaMaster_ID = desAreaID.ID.Value,
                        Des_AreaLocationMaster_ID = null,

                        EventStatus = WorkQueueEventStatus.IDLE,
                        Status = EntityStatus.ACTIVE,
                        StartTime = DateTime.Now,
                        QueueStatus = false,
                        docItemID = docItem.ID.Value,
                        DocumentItemWorkQueues = Common.ConverterModel.ToDocumentItemWorkQueue(docItems, mapsto)
                    });
                }

                foreach(var sto in stoList)
                {
                    distoIni.Add(new amt_DocumentItemStorageObject()
                    {
                        ID = (long?)null,
                        DocumentItem_ID = docItem.ID.Value,
                        Sou_StorageObject_ID = sto.ID.Value,
                        BaseQuantity = (decimal?)null,
                        Quantity = (decimal?)null,
                        BaseUnitType_ID = sto.BaseUnitType_ID,
                        UnitType_ID = sto.UnitType_ID,
                        Status = EntityStatus.INACTIVE
                    });
                }
            }

            var disto = new List<amt_DocumentItemStorageObject>();
            var getPalletLength = listWorkQueue.Count();
            if (reqVO.auditType == 0)
            {
                int percent = Convert.ToInt32(Math.Ceiling((reqVO.percent / 100) * getPalletLength));
                Random rnd = new Random();
                for(int i = 0; i < percent; i++)
                {
                    var idx = 0;
                    do {
                        idx = rnd.Next() % listWorkQueue.Count;
                    } while (listWorkQueue[idx].QueueStatus);
                    listWorkQueue[idx].QueueStatus = true;
                }
            }
            else if (reqVO.auditType == 1)
            {
                if(reqVO.percent > getPalletLength)
                {
                    foreach(var queue in listWorkQueue)
                    {
                        queue.QueueStatus = true;
                    }
                }
                else
                {
                    Random rnd = new Random();
                    for (int i = 0; i < reqVO.percent; i++)
                    {
                        var idx = rnd.Next(0, getPalletLength - (i + 1));
                        listWorkQueue[idx].QueueStatus = true;
                    }
                }
            }

            //List<long> stoIDs = new List<long>();
            //foreach (var queue in queueList)
            //{
            //    stoIDs.Add(ADO.DataADO.GetInstant().SelectBy<amt_StorageObject>(new SQLConditionCriteria[]{
            //            new SQLConditionCriteria("ParentStorageObject_ID", queue.StorageObject_ID, SQLOperatorType.EQUALS)
            //        }, this.BuVO).First().ID.Value);
            //}

            //disto = distoIni.Where(x => stoIDs.Contains(x.StorageObject_ID)).ToList();
            
            listQueue.docID = reqVO.docID;
            listQueue.workQueue = listWorkQueue;
            listQueue.disto = distoIni;
            return listQueue;
        }

        private WorkQueue GetWorkQueue(WorkQueue workQueue)
        {
            return new WorkQueue
            {
                ID = workQueue.ID,
                IOType = workQueue.IOType,
                ActualTime = workQueue.ActualTime,
                Parent_WorkQueue_ID = workQueue.Parent_WorkQueue_ID,
                Priority = workQueue.Priority,
                TargetStartTime = workQueue.TargetStartTime,

                StorageObject_ID = workQueue.StorageObject_ID,
                StorageObject_Code = workQueue.StorageObject_Code,

                Warehouse_ID = workQueue.Warehouse_ID,
                AreaMaster_ID = workQueue.AreaMaster_ID,
                AreaLocationMaster_ID = workQueue.AreaLocationMaster_ID,

                Sou_Warehouse_ID = workQueue.Sou_Warehouse_ID,
                Sou_AreaMaster_ID = workQueue.Sou_AreaMaster_ID,
                Sou_AreaLocationMaster_ID = workQueue.Sou_AreaLocationMaster_ID,

                Des_Warehouse_ID = workQueue.Des_Warehouse_ID,
                Des_AreaMaster_ID = workQueue.Des_AreaMaster_ID,
                Des_AreaLocationMaster_ID = workQueue.Des_AreaLocationMaster_ID,

                EventStatus = workQueue.EventStatus,
                Status = workQueue.Status,
                StartTime = workQueue.StartTime,
                QueueStatus = workQueue.QueueStatus,
                docItemID = workQueue.docItemID,
                DocumentItemWorkQueues = workQueue.DocumentItemWorkQueues
            };
        }

    }
}
