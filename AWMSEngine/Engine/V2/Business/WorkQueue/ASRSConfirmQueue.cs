using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.WorkQueue
{
    public class ASRSConfirmQueue : BaseEngine<ASRSConfirmQueue.TReq, ASRSConfirmQueue.TRes>
    {

        public class TReq : ASRSProcessQueue.TRes
        {
        }
        public class TRes
        {
        }
        protected override TRes ExecuteEngine(TReq reqVO)
        {
            return null;
        }
    }
}
