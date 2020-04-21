using AMWUtil.Exception;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.WorkQueue
{
    public class ManualDoneQueue : BaseEngine<ManualDoneQueue.TReq, ManualDoneQueue.TRes>
    {
        public class TReq
        {
            public long[] queueID;
        }
        public class TRes
        {
            public List<WorkQueueCriteria> workQ;
        }
        protected override TRes ExecuteEngine(TReq reqVO)
        {
            //เช็คสถานะ q จาก wc
            List<WorkQueueCriteria> doneWorkQueue = new List<WorkQueueCriteria>();
            WorkQueueCriteria doneWorkQueues = new WorkQueueCriteria();
            foreach (var queue in reqVO.queueID)
            {               
                var queueTrx = ADO.WorkQueueADO.GetInstant().Get(queue, this.BuVO);
                var location = ADO.DataADO.GetInstant().SelectByID<ams_AreaLocationMaster>(queueTrx.Des_AreaLocationMaster_ID,this.BuVO);

                var doneWorkQueuedata = new DoneWorkQueue();
                    doneWorkQueues = doneWorkQueuedata.Execute(this.Logger, this.BuVO, new DoneWorkQueue.TReq()
                {
                    queueID = queueTrx.ID,
                    baseCode = queueTrx.StorageObject_Code,
                    warehouseCode = StaticValue.Warehouses.FirstOrDefault(x => x.ID == queueTrx.Warehouse_ID).Code,
                    locationCode = location.Code,
                    actualTime = queueTrx.ActualTime.Value

                });
                doneWorkQueue.Add(doneWorkQueues);
            }

            return new TRes() { workQ = doneWorkQueue };
        }

    }
}
