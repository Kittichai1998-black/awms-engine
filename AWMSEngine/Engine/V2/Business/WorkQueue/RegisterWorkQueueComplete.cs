using AWMSEngine.Engine.V2.Business;
using AWMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.WorkQueue
{
    public class RegisterWorkQueueComplete : BaseEngine<RegisterWorkQueue.TReq, List<long>>
    {
        protected override List<long> ExecuteEngine(RegisterWorkQueue.TReq reqVO)
        {
            var regQueue = new RegisterWorkQueue();
            var resRegQueue = regQueue.Execute(this.Logger, this.BuVO, reqVO);

            var workingData = new WorkingStageQueue.TReq()
            {
                warehouseCode = reqVO.warehouseCode,
                actualTime = DateTime.Now,
                areaCode = reqVO.desAreaCode,
                baseCode = reqVO.baseCode,
                locationCode = reqVO.desLocationCode,
                queueID = resRegQueue.queueID
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
            var resDone = doneQueue.Execute(this.Logger, this.BuVO, doneData);

            var workedDocument = new Document.WorkedDocument();
            var workedDocIDs = workedDocument.Execute(this.Logger, this.BuVO, resDone);
            var closingDocument = new Document.ClosingDocument();
            var closingDocIDs = closingDocument.Execute(this.Logger, this.BuVO, workedDocIDs);
            var closedDocument = new Document.ClosedDocument();
            var closedDocIDs = closedDocument.Execute(this.Logger, this.BuVO, closingDocIDs);

            return closedDocIDs;
        }
    }
}
