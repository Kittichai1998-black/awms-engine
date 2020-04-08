using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.WorkQueue
{
    public class ClosedWave : BaseEngine<ClosedWave.TReq, ClosedWave.TRes>
    {
        public class TReq { }

        public class TRes { }

        protected override TRes ExecuteEngine(TReq reqVO)
        {
            throw new NotImplementedException();
        }

    }
}
