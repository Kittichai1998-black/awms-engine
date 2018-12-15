using AMWUtil.Exception;
using AWMSEngine.ADO;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Criteria.SP.Request;
using AWMSModel.Criteria.SP.Response;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business.WorkQueue
{
    public class WorkingStageQueue : BaseEngine<WorkingStageQueue.TReq, WorkQueueCriteria>
    {
        public class TReq
        {
            public long? queueID;
            public string baseCode;
            public string warehouseCode;
            public string areaCode;
            public string locationCode;
            public string actualTime;
        }

        protected override WorkQueueCriteria ExecuteEngine(TReq reqVO)
        {
            var wm = this.StaticValue.Warehouses.FirstOrDefault(x => x.Code == reqVO.warehouseCode);
            if (wm == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบ Warehouse Code '" + reqVO.warehouseCode + "'");
            var am = this.StaticValue.AreaMasters.FirstOrDefault(x => x.Code == reqVO.areaCode && x.Warehouse_ID == wm.ID);
            if (am == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบ Area Code '" + reqVO.areaCode + "'");
            var lm = ADO.DataADO.GetInstant().SelectBy<ams_AreaLocationMaster>(
                new KeyValuePair<string, object>[] {
                    new KeyValuePair<string,object>("Code",reqVO.locationCode),
                    new KeyValuePair<string,object>("AreaMaster_ID",am.ID.Value),
                    new KeyValuePair<string,object>("Status", EntityStatus.ACTIVE)
                }, this.BuVO).FirstOrDefault();
            //if (lm == null)
                //throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบ Location Code '" + reqVO.locationCode + "'");

            var res = GenerateResult(reqVO, Convert.ToInt64(wm.ID), Convert.ToInt64(am.ID), lm == null ? null : lm.ID);

            return res;
        }

        private WorkQueueCriteria GenerateResult(TReq req, long wm, long am, long? lm)
        {
            var workqueueID = DataADO.GetInstant().SelectBy<amt_WorkQueue>(new SQLConditionCriteria[] {
                new SQLConditionCriteria("ID", req.queueID, SQLOperatorType.EQUALS)
            }, this.BuVO).FirstOrDefault();

            var baseID = DataADO.GetInstant().SelectBy<ams_BaseMaster>(new SQLConditionCriteria[] {
                new SQLConditionCriteria("Code", req.baseCode, SQLOperatorType.EQUALS)
            }, this.BuVO).FirstOrDefault();

            var eventStatus = workqueueID.EventStatus;
            if (wm == workqueueID.Des_Warehouse_ID
                && am == workqueueID.Des_Area_ID
                && lm == (workqueueID.Des_AreaLocation_ID == null ? null : lm))
            {
                if(eventStatus == WorkQueueEventStatus.WORKING)
                {
                    eventStatus = WorkQueueEventStatus.WORKED;
                    if (workqueueID.IOType == IOType.INPUT)
                    {
                        StorageObjectADO.GetInstant().UpdateStatusToChild(baseID.ID.Value, null, EntityStatus.ACTIVE, StorageObjectEventStatus.RECEIVED, this.BuVO);
                    }
                    else if (workqueueID.IOType == IOType.OUTPUT)
                    {
                        StorageObjectADO.GetInstant().UpdateStatusToChild(baseID.ID.Value, StorageObjectEventStatus.ISSUING, EntityStatus.ACTIVE, StorageObjectEventStatus.ISSUED, this.BuVO);
                    }
                }
                else
                {
                    throw new AMWException(this.Logger, AMWExceptionCode.V2002, "Cannot Complete Before Working");
                }
            }
            else
            {
                if (eventStatus == WorkQueueEventStatus.IDEL)
                {
                    eventStatus = WorkQueueEventStatus.WORKING;
                    if (workqueueID.IOType == IOType.INPUT)
                    {
                        StorageObjectADO.GetInstant().UpdateStatusToChild(baseID.ID.Value, null, EntityStatus.ACTIVE, StorageObjectEventStatus.RECEIVING, this.BuVO);
                    }
                    else if (workqueueID.IOType == IOType.OUTPUT)
                    {
                        StorageObjectADO.GetInstant().UpdateStatusToChild(baseID.ID.Value, null, EntityStatus.ACTIVE, StorageObjectEventStatus.ISSUING, this.BuVO);
                    }
                }
                else
                {
                    throw new AMWException(this.Logger, AMWExceptionCode.V2002, "ข้ามหน้าข้ามตา");
                }
            }



            SPworkQueue workQueue = new SPworkQueue() {
                ID = workqueueID.ID,
                IOType = workqueueID.IOType,
                Parent_WorkQueue_ID = workqueueID.Parent_WorkQueue_ID,   

                StorageObject_ID = workqueueID.StorageObject_ID,
                StorageObject_Code = workqueueID.StorageObject_Code,
                Sou_Warehouse_ID = workqueueID.Sou_Warehouse_ID,
                Sou_AreaMaster_ID = workqueueID.Sou_Area_ID,
                Sou_AreaLocationMaster_ID = workqueueID.Sou_AreaLocation_ID,
                Des_Warehouse_ID = workqueueID.Des_Warehouse_ID,
                Des_AreaMaster_ID = workqueueID.Des_Area_ID,
                Des_AreaLocationMaster_ID = workqueueID.Des_AreaLocation_ID,
                Priority = workqueueID.Priority,
                EventStatus = eventStatus,
                Status = workqueueID.Status,
                Warehouse_ID  = wm,
                AreaMaster_ID = am,
                AreaLocationMaster_ID = lm,
                EndTime = eventStatus == WorkQueueEventStatus.WORKED ? DateTime.Now : (DateTime?)null,
                DocumentItemWorkQueues = null,
            };

            var resQueue = WorkQueueADO.GetInstant().PUT(workQueue, this.BuVO);

            var sou_lm = ADO.DataADO.GetInstant().SelectBy<ams_AreaLocationMaster>(
                new KeyValuePair<string, object>[] {
                    new KeyValuePair<string,object>("ID",resQueue.Sou_AreaLocationMaster_ID),
                    new KeyValuePair<string,object>("AreaMaster_ID",resQueue.Sou_AreaMaster_ID),
                    new KeyValuePair<string,object>("Status", EntityStatus.ACTIVE)
                }, this.BuVO).FirstOrDefault();

            var des_lm = ADO.DataADO.GetInstant().SelectBy<ams_AreaLocationMaster>(
                new KeyValuePair<string, object>[] {
                    new KeyValuePair<string,object>("ID",resQueue.Des_AreaLocationMaster_ID),
                    new KeyValuePair<string,object>("AreaMaster_ID",resQueue.Des_AreaMaster_ID),
                    new KeyValuePair<string,object>("Status", EntityStatus.ACTIVE)
                }, this.BuVO).FirstOrDefault();

            var pre_lm = ADO.DataADO.GetInstant().SelectBy<ams_AreaLocationMaster>(
                new KeyValuePair<string, object>[] {
                    new KeyValuePair<string,object>("ID",resQueue.AreaLocationMaster_ID),
                    new KeyValuePair<string,object>("AreaMaster_ID",resQueue.AreaMaster_ID),
                    new KeyValuePair<string,object>("Status", EntityStatus.ACTIVE)
                }, this.BuVO).FirstOrDefault();

            var res = new WorkQueueCriteria()
            {
                souWarehouseCode = 
                this.StaticValue.Warehouses.FirstOrDefault(x => x.ID == resQueue.Sou_Warehouse_ID).Code,
                souAreaCode = 
                this.StaticValue.AreaMasters.FirstOrDefault(x => x.ID == resQueue.Sou_AreaMaster_ID).Code,
                souLocationCode = sou_lm == null ? null : sou_lm.Code,

                desWarehouseCode = this.StaticValue.Warehouses.FirstOrDefault(x => x.ID == resQueue.Des_Warehouse_ID).Code,
                desAreaCode = this.StaticValue.AreaMasters.FirstOrDefault(x => x.ID == resQueue.Des_AreaMaster_ID).Code,
                desLocationCode = des_lm == null ? null : des_lm.Code,

                queueID = resQueue.ID,
                baseInfo = null, //send null to wcs
                warehouseCode = resQueue.Warehouse_ID == 0 ? "" : 
                this.StaticValue.Warehouses.FirstOrDefault(x => x.ID == resQueue.Warehouse_ID).Code,
                areaCode = resQueue.AreaMaster_ID == 0 ? "" :
                this.StaticValue.AreaMasters.FirstOrDefault(x => x.ID == resQueue.AreaMaster_ID).Code,
                locationCode = pre_lm == null ? null : pre_lm.Code,
                queueParentID = resQueue.Parent_WorkQueue_ID == null ? null : resQueue.Parent_WorkQueue_ID,
                queueRefID = workqueueID.RefID == null ? null : workqueueID.RefID,
                queueStatus = resQueue.EventStatus,
                seq = workqueueID.Seq
            };

            return res;
        }
    }
}
