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
    public class CreateWorkQueueAudit : BaseEngine<CreateWorkQueueAudit.TReq, CreateWorkQueueAudit.TRes>
    {
        public class TReq
        {
            public long docID;
            public long? warehouseID;
            public string palletCode;//เลือกจาก pallet
            public string locationCode;//เลือกจาก ตำแหน่งจัดวาง
            public int priority;
            public long? desAreaID;
        }

        public class TRes
        {
            public long docID;
            public List<ItemList> listItems;
            public class ItemList
            {
                public string palletCode;
                public string itemCode;
            }
        }

        protected override TRes ExecuteEngine(TReq reqVO)
        {
            List<SPworkQueue> listWorkQueue = new List<SPworkQueue>();
            var disto = new List<amt_DocumentItemStorageObject>();

            var desAreaID = this.StaticValue.AreaMasters.First(x => x.ID == reqVO.desAreaID.Value);
            var docItems = ADO.DocumentADO.GetInstant().ListItem(reqVO.docID, this.BuVO);

            if (reqVO.palletCode != "")
            {
                var mapsto = ADO.StorageObjectADO.GetInstant().Get(reqVO.palletCode,(long?)null, (long?)null, false, true, this.BuVO);

                if(mapsto.areaID == 5)
                {
                    listWorkQueue.Add(new SPworkQueue()
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

                        DocumentItemWorkQueues = Common.ConverterModel.ToDocumentItemWorkQueue(docItems, mapsto)
                    });
                    
                    docItems.ForEach(x =>
                    {
                        var packMapsto = ADO.StorageObjectADO.GetInstant().Get(x.PackMaster_ID.Value, StorageObjectType.PACK, false, false, this.BuVO);
                        if(packMapsto != null)
                        {
                            disto.Add(new amt_DocumentItemStorageObject()
                            {
                                ID = (long?)null,
                                DocumentItem_ID = x.ID.Value,
                                StorageObject_ID = packMapsto.id.Value,
                                BaseQuantity = (decimal?)null,
                                Quantity = (decimal?)null,
                                BaseUnitType_ID = x.BaseUnitType_ID.Value,
                                UnitType_ID = x.UnitType_ID.Value
                            });
                        }
                        else
                        {
                            throw new AMWException(this.Logger, AMWExceptionCode.V3001, "ไม่มีสินค้าในระบบ");
                        }
                    });
                }
                else
                {
                    mapsto.eventStatus = StorageObjectEventStatus.AUDITING;
                    mapsto.areaID = reqVO.desAreaID.Value;
                    ADO.StorageObjectADO.GetInstant().PutV2(mapsto, this.BuVO);
                }
            }
            else if(reqVO.locationCode != "")
            {
                var getLocationID = ADO.DataADO.GetInstant().SelectByCodeActive<ams_AreaLocationMaster>(reqVO.locationCode, this.BuVO).ID;
                var mapstoLocation = ADO.StorageObjectADO.GetInstant().Get(reqVO.locationCode, (long?)null, (long?)null, false, true, this.BuVO);

                mapstoLocation.mapstos.ForEach(x =>
                {
                    if(x.type == StorageObjectType.BASE)
                    {
                        var mapsto = ADO.StorageObjectADO.GetInstant().Get(x.code, (long?)null, (long?)null, false, true, this.BuVO);
                        listWorkQueue.Add(new SPworkQueue()
                        {
                            ID = null,
                            IOType = IOType.OUTPUT,
                            ActualTime = DateTime.Now,
                            Parent_WorkQueue_ID = null,
                            Priority = reqVO.priority,
                            TargetStartTime = null,

                            StorageObject_ID = x.id,
                            StorageObject_Code = x.code,

                            Warehouse_ID = reqVO.warehouseID.Value,
                            AreaMaster_ID = x.areaID,
                            AreaLocationMaster_ID = x.parentID,

                            Sou_Warehouse_ID = reqVO.warehouseID.Value,
                            Sou_AreaMaster_ID = x.areaID,
                            Sou_AreaLocationMaster_ID = x.parentID,

                            Des_Warehouse_ID = desAreaID.Warehouse_ID.Value,
                            Des_AreaMaster_ID = desAreaID.ID.Value,
                            Des_AreaLocationMaster_ID = null,

                            EventStatus = WorkQueueEventStatus.IDLE,
                            Status = EntityStatus.ACTIVE,
                            StartTime = DateTime.Now,

                            DocumentItemWorkQueues = Common.ConverterModel.ToDocumentItemWorkQueue(docItems, x)
                        });

                        docItems.ForEach(y =>
                        {
                            var packMapsto = ADO.StorageObjectADO.GetInstant().Get(y.PackMaster_ID.Value, StorageObjectType.PACK, false, false, this.BuVO);
                            if (packMapsto != null)
                            {
                                disto.Add(new amt_DocumentItemStorageObject()
                                {
                                    ID = (long?)null,
                                    DocumentItem_ID = y.ID.Value,
                                    StorageObject_ID = packMapsto.id.Value,
                                    BaseQuantity = (decimal?)null,
                                    Quantity = (decimal?)null,
                                    BaseUnitType_ID = y.BaseUnitType_ID.Value,
                                    UnitType_ID = y.UnitType_ID.Value
                                });
                            }
                            else
                            {
                                throw new AMWException(this.Logger, AMWExceptionCode.V3001, "ไม่มีสินค้าในระบบ");
                            }
                        });
                    }
                });
            }
            else
            {
                

                docItems.ForEach(x =>
                {
                    var getSto = ADO.DataADO.GetInstant().SelectBy<amt_StorageObject>(new SQLConditionCriteria[]
                    {
                        new SQLConditionCriteria("Code", x.Code, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("Batch", x.Batch, SQLOperatorType.EQUALS),
                    }, this.BuVO);

                    if(getSto == null)
                    {
                        throw new AMWException(this.Logger, AMWExceptionCode.V1001, "สินค้า " + x.Code + " Batch : " + x.Batch + " ไม่มีในระบบ");
                    }
                    if(getSto.TrueForAll(y => y.EventStatus != 12))
                    {
                        throw new AMWException(this.Logger, AMWExceptionCode.B0001, "สินค้า " + x.Code + " Batch : " + x.Batch + " ต้องถูกมีสถานะรับเข้าสินค้าทั้งหมด");
                    }

                    var auditList = ADO.DocumentADO.GetInstant().ListAuditItem(x.ID.Value, x.Lot == "" ? null : x.Lot,
                        x.Batch == "" ? null : x.Batch, x.OrderNo == "" ? null : x.OrderNo, this.BuVO).ToList();

                    auditList.ForEach(y =>
                    {
                        var mapsto = ADO.StorageObjectADO.GetInstant().Get(y.sto_rootCode, (long?)null, (long?)null, false, true, this.BuVO);
                        listWorkQueue.Add(new SPworkQueue()
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

                            DocumentItemWorkQueues = Common.ConverterModel.ToDocumentItemWorkQueue(docItems, mapsto)
                        });

                        mapsto.ToTreeList().Where(z => z.type == StorageObjectType.PACK || z.code == x.Code).ToList().ForEach(z =>
                        {
                            disto.Add(new amt_DocumentItemStorageObject()
                            {
                                ID = (long?)null,
                                DocumentItem_ID = x.ID.Value,
                                StorageObject_ID = z.id.Value,
                                BaseQuantity = (decimal?)null,
                                Quantity = (decimal?)null,
                                BaseUnitType_ID = z.baseUnitID,
                                UnitType_ID = z.unitID
                            });
                        });
                    });
                    
                });
            }

            TRes listQueue = new TRes();
            var itemLists = new List<TRes.ItemList>();
            listWorkQueue.ForEach(x =>
            {
                SPworkQueue res = new SPworkQueue();
                if(x.Sou_AreaMaster_ID == 5)
                    res = ADO.WorkQueueADO.GetInstant().PUT(x, this.BuVO);

                ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(x.StorageObject_ID.Value, null, null, StorageObjectEventStatus.AUDITING, this.BuVO);
            });
            disto.ForEach(x =>
            {
                ADO.DocumentADO.GetInstant().MappingSTO(x, this.BuVO);
                var res = ADO.StorageObjectADO.GetInstant().Get(x.StorageObject_ID, StorageObjectType.PACK, false, false, this.BuVO);
                var resBase = ADO.StorageObjectADO.GetInstant().Get(res.parentID.Value, StorageObjectType.PACK, false, false, this.BuVO);
                itemLists.Add(new TRes.ItemList { itemCode = res.code, palletCode = resBase.code });
            });

            ADO.DocumentADO.GetInstant().UpdateStatusToChild(reqVO.docID, DocumentEventStatus.IDLE, null, DocumentEventStatus.WORKING, this.BuVO);
            listQueue.docID = reqVO.docID;
            listQueue.listItems = itemLists;
            return listQueue;
        }

    }
}
