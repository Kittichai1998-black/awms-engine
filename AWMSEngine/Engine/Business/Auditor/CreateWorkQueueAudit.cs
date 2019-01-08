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
            public string packCode;
            public string refID;
            public string ref2;
            public string batch;
            public string lot;
            public string orderNo;
            public int priority;
            public long? desAreaID;
        }

        public class TRes
        {
            public ViewDocument document;
            public class ViewDocument : amv_Document
            {
                public List<amv_DocumentItem> documentItems;
            }
            public List<SPOutSTORootCanUseCriteria> bstos;
        }

        protected override TRes ExecuteEngine(TReq reqVO)
        {
            List<SPworkQueue> listWorkQueue = new List<SPworkQueue>();
            
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
                    if(x.baseUnitID == 2)
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
                    }
                });
            }
            else
            {
                
            }







            return null;
        }

    }
}
