using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.WorkQueue
{
    public class DoneWorkQueueOnFloor : BaseQueue<DoneWorkQueueOnFloor.TReq, WorkQueueCriteria>
    {
        public class TReq
        {
            public long? docID;
            public List<long> packIDs;

        }
      
        protected override WorkQueueCriteria ExecuteEngine(TReq reqVO)
        {
            

            throw new NotImplementedException();
        }

    }
}
