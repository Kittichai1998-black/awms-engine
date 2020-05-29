using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Validation
{
    public class RegisterTokenRequestValidate : BaseEngine<NullCriteria, NullCriteria>
    {
        protected override NullCriteria ExecuteEngine(NullCriteria reqVO)
        {
            if (ObjectUtil.IsEmptyNull(this.RequestParam.username))
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "username");
            if (ObjectUtil.IsEmptyNull(this.RequestParam.password))
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "password");
            if (ObjectUtil.IsEmptyNull(this.RequestParam.secretKey))
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "secretKey");
            return null;
        }
    }
}
