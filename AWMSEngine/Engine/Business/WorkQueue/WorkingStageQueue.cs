using AMWUtil.Common;
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
    public class WorkingStageQueue : BaseQueue<WorkingStageQueue.TReq, WorkQueueCriteria>
    {
        public class TReq
        {
            public long? queueID;
            public string baseCode;
            public string warehouseCode;
            public string areaCode;
            public string locationCode;
            public DateTime actualTime;
        }
        protected override WorkQueueCriteria ExecuteEngine(TReq reqVO)
        {
            var queueTrx = this.UpdateWorkQueueWork(reqVO);

            var baseInfo = ADO.StorageObjectADO.GetInstant().Get(queueTrx.StorageObject_ID.Value, StorageObjectType.BASE, false, true, this.BuVO);
            var res = base.GenerateResponse(baseInfo, queueTrx);
            return res;
        }
        private SPworkQueue UpdateWorkQueueWork(TReq reqVO)
        {
            var queueTrx = ADO.WorkQueueADO.GetInstant().Get(reqVO.queueID.Value, this.BuVO);
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

            if (lm == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบ Location Code '" + reqVO.locationCode + "'");

            if (queueTrx.EventStatus == WorkQueueEventStatus.WORKED ||
                queueTrx.EventStatus == WorkQueueEventStatus.WORKING)
            {
                queueTrx.AreaLocationMaster_ID = lm.ID;
                queueTrx.AreaMaster_ID = am.ID.Value;
                queueTrx.Warehouse_ID = am.Warehouse_ID.Value;

                queueTrx.ActualTime = reqVO.actualTime;
                queueTrx.EndTime = reqVO.actualTime;

                if (queueTrx.Des_Warehouse_ID == queueTrx.Warehouse_ID &&
                    queueTrx.Des_AreaMaster_ID == queueTrx.AreaMaster_ID &&
                    (queueTrx.Des_AreaLocationMaster_ID ?? queueTrx.AreaLocationMaster_ID) == queueTrx.AreaLocationMaster_ID)
                {
                    queueTrx.EventStatus = WorkQueueEventStatus.WORKED;
                }
                else
                {
                    queueTrx.EventStatus = WorkQueueEventStatus.WORKING;
                }
                WorkQueueADO.GetInstant().PUT(queueTrx, this.BuVO);
            }
            else
            {
                throw new AMWException(this.Logger, AMWExceptionCode.V2002, "Cannot Complete Before Working");
            }

            return queueTrx;
        }
        

        
    }
}
