using AWMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.WorkQueue
{
    public class RegisterWorkQueueComplete : BaseEngine<RegisterWorkQueue.TReq, WorkQueueCriteria>
    {
        protected override WorkQueueCriteria ExecuteEngine(RegisterWorkQueue.TReq reqVO)
        {
            var regQueue = new RegisterWorkQueue();
            var resRegQueue = regQueue.Execute(this.Logger, this.BuVO, reqVO);

            var workingData = new WorkingStageQueue.TReq()
            {
                warehouseCode= reqVO.desAreaCode,
                actualTime= DateTime.Now,
                areaCode= reqVO.desAreaCode,
                baseCode= reqVO.baseCode,
                locationCode= reqVO.desLocationCode,
                queueID= resRegQueue.queueID
            };
            var workingQueue = new WorkingStageQueue();
            var resWorkingQueue = workingQueue.Execute(this.Logger, this.BuVO, workingData);

            var doneData = new DoneQ.TReq()
            {
                warehouseCode = resWorkingQueue.desWarehouseCode,
                actualTime = DateTime.Now,
                areaCode = resWorkingQueue.desAreaCode,
                baseCode = resWorkingQueue.baseInfo.baseCode,
                locationCode = resWorkingQueue.desLocationCode,
                queueID = resWorkingQueue.queueID
            };
            var doneQueue = new DoneQ();
            doneQueue.Execute(this.Logger, this.BuVO, doneData);

            return resRegQueue;
        }
    }
}
