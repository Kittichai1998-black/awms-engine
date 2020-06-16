using AMWUtil.Exception;
using AWMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Validation
{
    public class ValidateObjectSizeLowerLimit : ValidateObjectSizeLimit
    {
        protected override NullCriteria ExecuteEngine(StorageObjectCriteria reqVO)
        {
            this.ValidateLimit(reqVO, true, false);
            return null;
        }

    }
}
