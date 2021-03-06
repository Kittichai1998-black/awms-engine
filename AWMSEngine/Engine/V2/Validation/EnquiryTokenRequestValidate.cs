using AMWUtil.Common;
using AMWUtil.Exception;
using AMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Validation
{
    public class EnquiryTokenRequestValidate : BaseEngine<NullCriteria, NullCriteria>
    {
        protected override NullCriteria ExecuteEngine(NullCriteria reqVO)
        {
            if (ObjectUtil.IsEmptyNull(this.RequestParam.token))
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "token");
            if (ObjectUtil.IsEmptyNull(this.RequestParam.secretKey))
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "secretKey");
            return null;
        }
    }
}
