﻿using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Validation
{
    public class RegisterTokenRequestValidate : BaseEngine<NullCriteria, NullCriteria>
    {
        protected override NullCriteria ExecuteEngine(NullCriteria reqVO)
        {
            if (ObjectUtil.IsEmptyNull(this.RequestParam.username))
                throw this.NewAMWException(AMWExceptionCode.V0003, "username");
            if (ObjectUtil.IsEmptyNull(this.RequestParam.password))
                throw this.NewAMWException(AMWExceptionCode.V0003, "password");
            if (ObjectUtil.IsEmptyNull(this.RequestParam.secretKey))
                throw this.NewAMWException(AMWExceptionCode.V0003, "secretKey");
            return null;
        }
    }
}
