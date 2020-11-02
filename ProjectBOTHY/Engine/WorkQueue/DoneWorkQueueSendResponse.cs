using AMWUtil.Logger;
using AWMSEngine.Engine;
using AWMSEngine.Engine.V2.Business.WorkQueue;
using AWMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectBOTHY.Engine.WorkQueue
{
    public class DoneWorkQueueSendResponse : IProjectEngine<DoneWorkQueue.TReq, WorkQueueCriteria>
    {
        public WorkQueueCriteria ExecuteEngine(AMWLogger logger, VOCriteria buVO, DoneWorkQueue.TReq reqVO)
        {
            throw new NotImplementedException();
        }
    }
}
