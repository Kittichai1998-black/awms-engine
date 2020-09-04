using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.Auditor
{
    public class GetSTOAudit : BaseEngine<GetSTOAudit.TReq, GetSTOAudit.TRes>
    {
      
        public class TReq
        {
            public long? bstoID;
            public string bstoCode;
        }
        public class TRes
        {
            public List<long> docIDs;
        }

        protected override TRes ExecuteEngine(TReq reqVO)
        {
            
            
            throw new NotImplementedException();
        }

    }
}
