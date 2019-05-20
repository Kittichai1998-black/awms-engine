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

namespace AWMSEngine.Engine.V2.Business.WorkQueue
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
            this.initMasterData(reqVO);
            var queueTrx = this.UpdateWorkQueueWork(reqVO);
            if (queueTrx.StorageObject_Code != reqVO.baseCode)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Base Code '" + reqVO.baseCode + "' doesn't match with in Work Queue '" + queueTrx.StorageObject_Code + "'");

            var baseInfo = this.UpdateStorageObject(reqVO, queueTrx);

            var res = base.GenerateResponse(baseInfo, queueTrx);
            return res;
        }
         
        private ams_Warehouse wm;
        private ams_AreaMaster am;
        private ams_AreaLocationMaster lm;

        private void initMasterData(TReq reqVO)
        {
            wm = this.StaticValue.Warehouses.FirstOrDefault(x => x.Code == reqVO.warehouseCode);
            if (wm == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Warehouse Code '" + reqVO.warehouseCode + "' Not Found");

            am = this.StaticValue.AreaMasters.FirstOrDefault(x => x.Code == reqVO.areaCode && x.Warehouse_ID == wm.ID);
            if (am == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Area Code '" + reqVO.areaCode + "' Not Found");

            lm = ADO.DataADO.GetInstant().SelectBy<ams_AreaLocationMaster>(
                new KeyValuePair<string, object>[] {
                    new KeyValuePair<string,object>("Code",reqVO.locationCode),
                    new KeyValuePair<string,object>("AreaMaster_ID",am.ID.Value),
                    new KeyValuePair<string,object>("Status", EntityStatus.ACTIVE)
                }, this.BuVO).FirstOrDefault();

            if (lm == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Location Code '" + reqVO.locationCode + "'  Not Found");
        }

        private SPworkQueue UpdateWorkQueueWork(TReq reqVO)
        {
            var queueTrx = ADO.WorkQueueADO.GetInstant().Get(reqVO.queueID.Value, this.BuVO);

            if (queueTrx.EventStatus == WorkQueueEventStatus.WORKED ||
                queueTrx.EventStatus == WorkQueueEventStatus.WORKING ||
                queueTrx.EventStatus == WorkQueueEventStatus.NEW)
            {
                queueTrx.AreaLocationMaster_ID = lm.ID;
                queueTrx.AreaMaster_ID = am.ID.Value;
                queueTrx.Warehouse_ID = am.Warehouse_ID.Value;

                queueTrx.ActualTime = reqVO.actualTime;
                queueTrx.EndTime = reqVO.actualTime;
                //
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
                throw new AMWException(this.Logger, AMWExceptionCode.V2002, "Queue status not Working");
            }

            return queueTrx;
        }

        private StorageObjectCriteria UpdateStorageObject(TReq reqVO, SPworkQueue queueTrx)
        {
            var baseInfo = ADO.StorageObjectADO.GetInstant().Get(queueTrx.StorageObject_ID.Value, StorageObjectType.BASE, false, true, this.BuVO);

            ADO.StorageObjectADO.GetInstant().UpdateLocationToChild(baseInfo, this.lm.ID.Value, this.BuVO);
            return baseInfo;
        }
    }
}
