using AMWUtil.Exception;
using AMSModel.Criteria;
using Org.BouncyCastle.Ocsp;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Validation
{
    public class ValidateObjectSizeOverLimit : ValidateObjectSizeLimit
    {
        protected override NullCriteria ExecuteEngine(StorageObjectCriteria reqVO)
        {
            this.ValidateLimit(reqVO, false, true);
            return null;
        }
    }
}