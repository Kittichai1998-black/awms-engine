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
            public List<long> stoPackIDs;

        }
      
        private ams_AreaLocationMaster _location;
        private ams_Warehouse _warehouse;
        private ams_AreaMaster _area;

        protected override WorkQueueCriteria ExecuteEngine(TReq reqVO)
        {


            throw new NotImplementedException();
        }

    }
}
