﻿using AMWUtil.Common;
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
            public List<SPworkQueue> workQueue;
            public List<amt_DocumentItemStorageObject> disto;
        }

        private class workQueue : SPworkQueue
        {
            public long docItemID;
        }

        protected override TRes ExecuteEngine(TReq reqVO)
        {
            TRes listQueue = new TRes();
            List<workQueue> listWorkQueue = new List<workQueue>();
            var distoIni = new List<amt_DocumentItemStorageObject>();

            var desAreaID = this.StaticValue.AreaMasters.First(x => x.ID == reqVO.desAreaID.Value);
            var docItems = ADO.DocumentADO.GetInstant().ListItem(reqVO.docID, this.BuVO);

            foreach(var docItem in docItems)
            {
                var stoList = ADO.DocumentADO.GetInstant().getSTOList(docItem.ID.Value, this.BuVO);
                if (stoList.Count == 0)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่มีสินค้าสำหรับ PI ในคลังสินค้า");
                var palletList = stoList.GroupBy(x => new { x.ParentStorageObject_ID }).Select(g => g.Key.ParentStorageObject_ID).ToList();

                foreach(var palletID in palletList)
                {
                    var mapsto = ADO.StorageObjectADO.GetInstant().Get(palletID.Value, StorageObjectType.BASE, false, true, this.BuVO);
                    listWorkQueue.Add(new workQueue()
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
                        StorageObject_ID = sto.ID.Value,
                        BaseQuantity = (decimal?)null,
                        Quantity = (decimal?)null,
                        BaseUnitType_ID = docItem.BaseUnitType_ID.Value,
                        UnitType_ID = docItem.UnitType_ID.Value
                    });
                }
            }

            var queueList = new List<SPworkQueue>();
            var disto = new List<amt_DocumentItemStorageObject>();
            var getPalletLength = listWorkQueue.Count();
            if (reqVO.auditType == 0)
            {
                int percent = Convert.ToInt32(Math.Ceiling((reqVO.percent / 100) * getPalletLength));
                Random rnd = new Random();
                for(int i = 0; i < percent; i++)
                {
                    var idx = rnd.Next(0, getPalletLength - (i + 1));
                    var workQueue = GetWorkQueue(listWorkQueue[idx]);
                    queueList.Add(workQueue);
                    listWorkQueue.RemoveAt(idx);
                }
            }
            else if (reqVO.auditType == 1)
            {
                if(reqVO.percent > getPalletLength)
                {
                    foreach(var queue in listWorkQueue)
                    {
                        queueList.Add(GetWorkQueue(queue));
                    }
                }
                else
                {
                    Random rnd = new Random();
                    for (int i = 0; i < reqVO.percent; i++)
                    {
                        var idx = rnd.Next(0, getPalletLength - (i + 1));
                        var workQueue = GetWorkQueue(listWorkQueue[idx]);
                        queueList.Add(workQueue);
                        listWorkQueue.RemoveAt(idx);
                    }
                }
            }

            List<long> stoIDs = new List<long>();
            foreach (var queue in queueList)
            {
                stoIDs.Add(ADO.DataADO.GetInstant().SelectBy<amt_StorageObject>(new SQLConditionCriteria[]{
                        new SQLConditionCriteria("ParentStorageObject_ID", queue.StorageObject_ID, SQLOperatorType.EQUALS)
                    }, this.BuVO).First().ID.Value);
                
            }

            disto = distoIni.Where(x => stoIDs.Contains(x.StorageObject_ID)).ToList();

            #region old
            //if (reqVO.palletCode != "")
            //{
            //    var mapsto = ADO.StorageObjectADO.GetInstant().Get(reqVO.palletCode,(long?)null, (long?)null, false, true, this.BuVO);

            //    if(mapsto.areaID == 5)
            //    {
            //        listWorkQueue.Add(new SPworkQueue()
            //        {
            //            ID = null,
            //            IOType = IOType.OUTPUT,
            //            ActualTime = DateTime.Now,
            //            Parent_WorkQueue_ID = null,
            //            Priority = reqVO.priority,
            //            TargetStartTime = null,

            //            StorageObject_ID = mapsto.id,
            //            StorageObject_Code = mapsto.code,

            //            Warehouse_ID = reqVO.warehouseID.Value,
            //            AreaMaster_ID = mapsto.areaID,
            //            AreaLocationMaster_ID = mapsto.parentID,

            //            Sou_Warehouse_ID = reqVO.warehouseID.Value,
            //            Sou_AreaMaster_ID = mapsto.areaID,
            //            Sou_AreaLocationMaster_ID = mapsto.parentID,

            //            Des_Warehouse_ID = desAreaID.Warehouse_ID.Value,
            //            Des_AreaMaster_ID = desAreaID.ID.Value,
            //            Des_AreaLocationMaster_ID = null,

            //            EventStatus = WorkQueueEventStatus.IDLE,
            //            Status = EntityStatus.ACTIVE,
            //            StartTime = DateTime.Now,

            //            DocumentItemWorkQueues = Common.ConverterModel.ToDocumentItemWorkQueue(docItems, mapsto)
            //        });

            //        docItems.ForEach(x =>
            //        {
            //            var packMapsto = ADO.StorageObjectADO.GetInstant().Get(x.PackMaster_ID.Value, StorageObjectType.PACK, false, false, this.BuVO);
            //            if(packMapsto != null)
            //            {
            //                disto.Add(new amt_DocumentItemStorageObject()
            //                {
            //                    ID = (long?)null,
            //                    DocumentItem_ID = x.ID.Value,
            //                    StorageObject_ID = packMapsto.id.Value,
            //                    BaseQuantity = (decimal?)null,
            //                    Quantity = (decimal?)null,
            //                    BaseUnitType_ID = x.BaseUnitType_ID.Value,
            //                    UnitType_ID = x.UnitType_ID.Value
            //                });
            //            }
            //            else
            //            {
            //                throw new AMWException(this.Logger, AMWExceptionCode.V3001, "ไม่มีสินค้าในระบบ");
            //            }
            //        });
            //    }
            //    else
            //    {
            //        mapsto.eventStatus = StorageObjectEventStatus.AUDITING;
            //        mapsto.areaID = reqVO.desAreaID.Value;
            //        ADO.StorageObjectADO.GetInstant().PutV2(mapsto, this.BuVO);
            //    }
            //}
            //else if(reqVO.locationCode != "")
            //{
            //    var getLocationID = ADO.DataADO.GetInstant().SelectByCodeActive<ams_AreaLocationMaster>(reqVO.locationCode, this.BuVO).ID;
            //    var mapstoLocation = ADO.StorageObjectADO.GetInstant().Get(reqVO.locationCode, (long?)null, (long?)null, false, true, this.BuVO);

            //    mapstoLocation.mapstos.ForEach(x =>
            //    {
            //        if(x.type == StorageObjectType.BASE)
            //        {
            //            var mapsto = ADO.StorageObjectADO.GetInstant().Get(x.code, (long?)null, (long?)null, false, true, this.BuVO);
            //            listWorkQueue.Add(new SPworkQueue()
            //            {
            //                ID = null,
            //                IOType = IOType.OUTPUT,
            //                ActualTime = DateTime.Now,
            //                Parent_WorkQueue_ID = null,
            //                Priority = reqVO.priority,
            //                TargetStartTime = null,

            //                StorageObject_ID = x.id,
            //                StorageObject_Code = x.code,

            //                Warehouse_ID = reqVO.warehouseID.Value,
            //                AreaMaster_ID = x.areaID,
            //                AreaLocationMaster_ID = x.parentID,

            //                Sou_Warehouse_ID = reqVO.warehouseID.Value,
            //                Sou_AreaMaster_ID = x.areaID,
            //                Sou_AreaLocationMaster_ID = x.parentID,

            //                Des_Warehouse_ID = desAreaID.Warehouse_ID.Value,
            //                Des_AreaMaster_ID = desAreaID.ID.Value,
            //                Des_AreaLocationMaster_ID = null,

            //                EventStatus = WorkQueueEventStatus.IDLE,
            //                Status = EntityStatus.ACTIVE,
            //                StartTime = DateTime.Now,

            //                DocumentItemWorkQueues = Common.ConverterModel.ToDocumentItemWorkQueue(docItems, x)
            //            });

            //            docItems.ForEach(y =>
            //            {
            //                var packMapsto = ADO.StorageObjectADO.GetInstant().Get(y.PackMaster_ID.Value, StorageObjectType.PACK, false, false, this.BuVO);
            //                if (packMapsto != null)
            //                {
            //                    disto.Add(new amt_DocumentItemStorageObject()
            //                    {
            //                        ID = (long?)null,
            //                        DocumentItem_ID = y.ID.Value,
            //                        StorageObject_ID = packMapsto.id.Value,
            //                        BaseQuantity = (decimal?)null,
            //                        Quantity = (decimal?)null,
            //                        BaseUnitType_ID = y.BaseUnitType_ID.Value,
            //                        UnitType_ID = y.UnitType_ID.Value
            //                    });
            //                }
            //                else
            //                {
            //                    throw new AMWException(this.Logger, AMWExceptionCode.V3001, "ไม่มีสินค้าในระบบ");
            //                }
            //            });
            //        }
            //    });
            //}
            //else
            //{


            //    docItems.ForEach(x =>
            //    {
            //        var getSto = ADO.DataADO.GetInstant().SelectBy<amt_StorageObject>(new SQLConditionCriteria[]
            //        {
            //            new SQLConditionCriteria("Code", x.Code, SQLOperatorType.EQUALS),
            //            new SQLConditionCriteria("Batch", x.Batch, SQLOperatorType.EQUALS),
            //        }, this.BuVO);

            //        if(getSto == null)
            //        {
            //            throw new AMWException(this.Logger, AMWExceptionCode.V1001, "สินค้า " + x.Code + " Batch : " + x.Batch + " ไม่มีในระบบ");
            //        }
            //        if(getSto.TrueForAll(y => y.EventStatus != 12))
            //        {
            //            throw new AMWException(this.Logger, AMWExceptionCode.B0001, "สินค้า " + x.Code + " Batch : " + x.Batch + " ต้องถูกมีสถานะรับเข้าสินค้าทั้งหมด");
            //        }

            //        var auditList = ADO.DocumentADO.GetInstant().ListAuditItem(x.ID.Value, x.Lot == "" ? null : x.Lot,
            //            x.Batch == "" ? null : x.Batch, x.OrderNo == "" ? null : x.OrderNo, this.BuVO).ToList();

            //        auditList.ForEach(y =>
            //        {
            //            var mapsto = ADO.StorageObjectADO.GetInstant().Get(y.sto_rootCode, (long?)null, (long?)null, false, true, this.BuVO);
            //            listWorkQueue.Add(new SPworkQueue()
            //            {
            //                ID = null,
            //                IOType = IOType.OUTPUT,
            //                ActualTime = DateTime.Now,
            //                Parent_WorkQueue_ID = null,
            //                Priority = reqVO.priority,
            //                TargetStartTime = null,

            //                StorageObject_ID = mapsto.id,
            //                StorageObject_Code = mapsto.code,

            //                Warehouse_ID = reqVO.warehouseID.Value,
            //                AreaMaster_ID = mapsto.areaID,
            //                AreaLocationMaster_ID = mapsto.parentID,

            //                Sou_Warehouse_ID = reqVO.warehouseID.Value,
            //                Sou_AreaMaster_ID = mapsto.areaID,
            //                Sou_AreaLocationMaster_ID = mapsto.parentID,

            //                Des_Warehouse_ID = desAreaID.Warehouse_ID.Value,
            //                Des_AreaMaster_ID = desAreaID.ID.Value,
            //                Des_AreaLocationMaster_ID = null,

            //                EventStatus = WorkQueueEventStatus.IDLE,
            //                Status = EntityStatus.ACTIVE,
            //                StartTime = DateTime.Now,

            //                DocumentItemWorkQueues = Common.ConverterModel.ToDocumentItemWorkQueue(docItems, mapsto)
            //            });

            //            mapsto.ToTreeList().Where(z => z.type == StorageObjectType.PACK || z.code == x.Code).ToList().ForEach(z =>
            //            {
            //                disto.Add(new amt_DocumentItemStorageObject()
            //                {
            //                    ID = (long?)null,
            //                    DocumentItem_ID = x.ID.Value,
            //                    StorageObject_ID = z.id.Value,
            //                    BaseQuantity = (decimal?)null,
            //                    Quantity = (decimal?)null,
            //                    BaseUnitType_ID = z.baseUnitID,
            //                    UnitType_ID = z.unitID
            //                });
            //            });
            //        });

            //    });
            //}

            //TRes listQueue = new TRes();
            //listWorkQueue.ForEach(x =>
            //{
            //    SPworkQueue res = new SPworkQueue();
            //    if(x.Sou_AreaMaster_ID == 5)
            //        res = ADO.WorkQueueADO.GetInstant().PUT(x, this.BuVO);

            //    ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(x.StorageObject_ID.Value, null, null, StorageObjectEventStatus.AUDITING, this.BuVO);
            //});
            //disto.ForEach(x =>
            //{
            //    ADO.DocumentADO.GetInstant().MappingSTO(x, this.BuVO);
            //    var res = ADO.StorageObjectADO.GetInstant().Get(x.StorageObject_ID, StorageObjectType.PACK, false, false, this.BuVO);
            //    var resBase = ADO.StorageObjectADO.GetInstant().Get(res.parentID.Value, StorageObjectType.PACK, false, false, this.BuVO);
            //});

            //ADO.DocumentADO.GetInstant().UpdateStatusToChild(reqVO.docID, DocumentEventStatus.IDLE, null, DocumentEventStatus.WORKING, this.BuVO);
            #endregion

            listQueue.docID = reqVO.docID;
            listQueue.workQueue = queueList;
            listQueue.disto = disto;
            return listQueue;
        }

        private SPworkQueue GetWorkQueue(workQueue workQueue)
        {
            return new SPworkQueue
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
                DocumentItemWorkQueues = workQueue.DocumentItemWorkQueues
            };
        }

    }
}