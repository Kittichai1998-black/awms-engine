using AMWUtil.Exception;
using AWMSEngine.ADO;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Criteria.SP.Request;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business.WorkQueue
{
    public class DoneQueue : BaseEngine<DoneQueue.TReq, WorkQueueCriteria>
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
            long? wmid, amid, lmid = null;
            var wm = this.StaticValue.Warehouses.FirstOrDefault(x => x.Code == reqVO.warehouseCode);
            if (wm == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบ Warehouse Code '" + reqVO.warehouseCode + "'");
            else
                wmid = wm.ID;

            var am = this.StaticValue.AreaMasters.FirstOrDefault(x => x.Code == reqVO.areaCode && x.Warehouses_ID == wm.ID);
            if (am == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบ Area Code '" + reqVO.areaCode + "'");
            else
                amid = am.ID;

            var lm = ADO.DataADO.GetInstant().SelectBy<ams_AreaLocationMaster>(
                new KeyValuePair<string, object>[] {
                    new KeyValuePair<string,object>("Code",reqVO.locationCode),
                    new KeyValuePair<string,object>("Area_ID",am.ID.Value),
                    new KeyValuePair<string,object>("Status", EntityStatus.ACTIVE)
                }, this.BuVO).FirstOrDefault();
            if (lm == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบ Location Code '" + reqVO.locationCode + "'");
            else
                lmid = lm.ID;

            var res = GenerateResult(reqVO, wmid, amid, lmid);

            return res;
        }

        private WorkQueueCriteria GenerateResult(TReq req, int? wm, int? am, int? lm)
        {
            var selectByID = DataADO.GetInstant().SelectBy<amt_WorkQueue>(new SQLConditionCriteria[] {
                new SQLConditionCriteria("ID", req.queueID, SQLOperatorType.EQUALS)
            }, this.BuVO).FirstOrDefault();

            var eventStatus = selectByID.EventStatus;
            if (wm == selectByID.Des_Warehouse_ID
                && am == selectByID.Des_Area_ID
                && lm == (selectByID.Des_AreaLocation_ID ? null : lm)
                )
            {
                if (eventStatus == WorkQueueEventStatus.WORKED)
                {
                    eventStatus = WorkQueueEventStatus.COMPLETIED;
                }
                else
                {
                    throw new AMWException(this.Logger, AMWExceptionCode.V2002, "Cannot Complete Before Working");
                }
            }
            else
            {
                throw new AMWException(this.Logger, AMWExceptionCode.V2002, "ไม่ตรงกัน");
            }

            SPworkQueue workQueue = new SPworkQueue()
            {
                ID = selectByID.ID,
                IOType = selectByID.IOType,
                Parent_WorkQueue_ID = selectByID.Parent_WorkQueue_ID,
                Document_ID = selectByID.Document_ID,
                DocumentItem_ID = selectByID.DocumentItem_ID,
                StorageObject_ID = selectByID.StorageObject_ID,
                StorageObject_Code = selectByID.StorageObject_Code,
                Sou_Warehouse_ID = selectByID.Sou_Warehouse_ID,
                Sou_AreaMaster_ID = selectByID.Sou_Area_ID,
                Sou_AreaLocationMaster_ID = selectByID.Sou_AreaLocation_ID,
                Des_Warehouse_ID = selectByID.Des_Warehouse_ID,
                Des_AreaMaster_ID = selectByID.Des_Area_ID,
                Des_AreaLocationMaster_ID = selectByID.Des_AreaLocation_ID,
                Priority = selectByID.Priority,
                EventStatus = eventStatus,
                Status = selectByID.Status
            };

            var resQueue = QueueADO.GetInstant().PUT(workQueue, this.BuVO);

            var res = new WorkQueueCriteria()
            {
                souWarehouseCode = this.StaticValue.Warehouses.FirstOrDefault(x => x.ID == resQueue.Sou_Warehouse_ID).Code,
                souAreaCode = this.StaticValue.Warehouses.FirstOrDefault(x => x.ID == resQueue.Sou_AreaMaster_ID).Code,
                souLocationCode = this.StaticValue.Warehouses.FirstOrDefault(x => x.ID == resQueue.Sou_AreaLocationMaster_ID).Code,

                desWarehouseCode = this.StaticValue.Warehouses.FirstOrDefault(x => x.ID == resQueue.Des_Warehouse_ID).Code,
                desAreaCode = this.StaticValue.Warehouses.FirstOrDefault(x => x.ID == resQueue.Des_AreaMaster_ID).Code,
                desLocationCode = this.StaticValue.Warehouses.FirstOrDefault(x => x.ID == resQueue.Des_AreaLocationMaster_ID).Code,

                queueID = resQueue.ID,
                baseInfo = null, //send null to wcs
                warehouseCode = this.StaticValue.Warehouses.FirstOrDefault(x => x.ID == resQueue.Warehouse_ID).Code,
                areaCode = this.StaticValue.Warehouses.FirstOrDefault(x => x.ID == resQueue.AreaMaster_ID).Code,
                locationCode = this.StaticValue.Warehouses.FirstOrDefault(x => x.ID == resQueue.AreaLocationMaster_ID).Code,
                queueParentID = resQueue.Parent_WorkQueue_ID,
                queueRefID = selectByID.RefID,
                queueStatus = resQueue.EventStatus,
                seq = selectByID.Seq
            };

            return res;
        }
    }
}
