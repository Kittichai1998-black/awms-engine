using AWMSEngine.Engine.V2.Business;
using AMSModel.Criteria;
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

            var workingData = new WorkingWorkQueue.TReq()
            {
                warehouseCode = reqVO.warehouseCode,
                actualTime = DateTime.Now,
                areaCode = reqVO.desAreaCode,
                baseCode = reqVO.baseCode,
                locationCode = reqVO.desLocationCode,
                queueID = resRegQueue.queueID
            };
            var workingQueue = new WorkingWorkQueue();
            var resWorkingQueue = workingQueue.Execute(this.Logger, this.BuVO, workingData);

            var doneData = new DoneWorkQueue.TReq()
            {
                warehouseCode = resWorkingQueue.desWarehouseCode,
                actualTime = DateTime.Now,
                areaCode = resWorkingQueue.desAreaCode,
                baseCode = resWorkingQueue.baseInfo.baseCode,
                locationCode = resWorkingQueue.desLocationCode,
                queueID = resWorkingQueue.queueID
            };
            var doneQueue = new DoneWorkQueue();
            var resDone = doneQueue.Execute(this.Logger, this.BuVO, doneData);

            var workedDocument = new Document.WorkedDocument();
            var workedDocIDs = workedDocument.Execute(this.Logger, this.BuVO, new Document.WorkedDocument.TReq() { docIDs = resDone.docIDs });
            var closingDocument = new Document.ClosingDocument();
            var closingDocIDs = closingDocument.Execute(this.Logger, this.BuVO, workedDocIDs);
            var closedDocument = new Document.ClosedDocument();
            var closedDocIDs = closedDocument.Execute(this.Logger, this.BuVO, closingDocIDs);

            return closedDocIDs;
        }
    }
}
