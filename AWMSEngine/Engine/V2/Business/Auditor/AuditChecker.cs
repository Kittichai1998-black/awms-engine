using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.Auditor
{
    public class AuditChecker : BaseEngine<AuditChecker.TReq, GetSTOAudit.TRes>
    {
       
        public class TReq
        { 
        }
        protected override GetSTOAudit.TRes ExecuteEngine(TReq reqVO)
        {
            throw new NotImplementedException();
        }

    }
}
