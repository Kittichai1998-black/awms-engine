using AWMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business.WorkQueue
{
    public class DoneQueue : BaseEngine<DoneQueue.TReq, DoneQueue.TRes>
    {
        public class TReq
        {
            public long queueID;
            public string baseCode;
            public string warehouseCode;
            public string areaCode;
            public string loactionCode;
            public DateTime actionTime;
        }
        public class TRes
        {
            public long queueID;
            public WorkQueueEventStatus eventStatus;
        }
        protected override TRes ExecuteEngine(TReq reqVO)
        {
            throw new NotImplementedException();
        }
    }
}
