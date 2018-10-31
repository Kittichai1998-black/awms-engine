using AWMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business.WorkQueue
{
    public class UpdateQueueEvent : BaseEngine<UpdateQueueEvent.TReq,UpdateQueueEvent.TRes>
    {
        public class TReq
        {
            public string baseCode;
            public string warehouseCode;
            public string areaCode;
            public string loactionCode;
            public WorkQueueEventStatus eventStatus;
        }
        public class TRes
        {

        }
        protected override TRes ExecuteEngine(TReq reqVO)
        {
            throw new NotImplementedException();
        }

    }
}
