using ADO.WMSAPI;
using AMWUtil.Exception;
using AMSModel.Constant.EnumConst;
using AMSModel.Criteria;
using AMSModel.Entity;
using System.Collections.Generic;
using System.Linq;
using AMSModel.Criteria.API;

namespace AWMSEngine.Engine.V2.Business.WorkQueue
{
    public class ManualDoneQueue : BaseEngine<CallOldWcsAPI.TReqCheckQueue, ManualDoneQueue.TRes>
    {

        public class TRes
        {
            public List<WorkQueueCriteria> workQ;
        }
        protected override TRes ExecuteEngine(CallOldWcsAPI.TReqCheckQueue reqVO)
        {
            //เช็คสถานะ q จาก wc

            List<WorkQueueCriteria> doneWorkQueue = new List<WorkQueueCriteria>();
            WorkQueueCriteria doneWorkQueues = new WorkQueueCriteria();

            var checkQueues = CallOldWcsAPI.GetInstant().SendCheckQueue(reqVO, this.BuVO);

            if (checkQueues.data.Count == 0)
                throw new AMWException(this.Logger, AMWExceptionCode.B0001, "Not respones from WCS");

            foreach (var checkQueue in checkQueues.data)
            {
                if (checkQueue.status == WCSQueueStatus.QUEUE_DONE)
                {
                    foreach (var queue in reqVO.queueID)
                    {
                        var queueTrx = ADO.WMSDB.WorkQueueADO.GetInstant().Get(queue, this.BuVO);
                        var location = ADO.WMSDB.DataADO.GetInstant().SelectByID<ams_AreaLocationMaster>(queueTrx.Des_AreaLocationMaster_ID, this.BuVO);

                        var doneWorkQueuedata = new DoneWorkQueue();
                        doneWorkQueues = doneWorkQueuedata.Execute(this.Logger, this.BuVO, new WMReq_DoneWQ()
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
                                                            