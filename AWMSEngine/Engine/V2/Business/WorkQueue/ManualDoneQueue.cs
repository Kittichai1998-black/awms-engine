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
    public class ManualDoneQueue : BaseEngine<ADO.QueueApi.WCSQueueADO.TReqCheckQueue, ManualDoneQueue.TRes>
    {

        public class TRes
        {
            public List<WorkQueueCriteria> workQ;
        }
        protected override TRes ExecuteEngine(ADO.QueueApi.WCSQueueADO.TReqCheckQueue reqVO)
        {
            //เช็คสถานะ q จาก wc

            List<WorkQueueCriteria> doneWorkQueue = new List<WorkQueueCriteria>();
            WorkQueueCriteria doneWorkQueues = new WorkQueueCriteria();

            var checkQueues = ADO.QueueApi.WCSQueueADO.GetInstant().SendCheckQueue(reqVO, this.BuVO);

            if (checkQueues.data.Count == 0)
                throw new AMWException(this.Logger, AMWExceptionCode.B0001, "Not respones from WCS");

            foreach (var checkQueue in checkQueues.data)
            {
                if (checkQueue.status == WCSQueueStatus.QUEUE_DONE)
                {
                    foreach (var queue in reqVO.queueID)
                    {
                        var queueTrx = ADO.WorkQueueADO.GetInstant().Get(queue, this.BuVO);
                        var location = ADO.DataADO.GetInstant().SelectByID<ams_AreaLocationMaster>(queueTrx.Des_AreaLocationMaster_ID, this.BuVO);

                        var doneWorkQueuedata = new DoneWorkQueue();
                        doneWorkQueues = doneWorkQueuedata.Execute(this.Logger, this.BuVO, new DoneWorkQueue.TReq()
                        {
                            queueID = queueTrx.ID,
                            baseCode = queueTrx.StorageObject_Code,
                            warehouseCode = StaticValue.Warehouses.FirstOrDefault(x => x.ID == queueTrx.Warehouse_ID).Code,
                            locationCode = location.Code,
                            areaCode = StaticValue.AreaMasters.FirstOrDefault(x => x.ID == queueTrx.AreaMaster_ID).Code,
                            actualTime = queueTrx.ActualTime.Value

                        });
                        doneWorkQueue.Add(doneWorkQueues);
                    }
                }
            }
          
            return new TRes() { workQ = doneWorkQueue };
        }

    }
}
                                                            