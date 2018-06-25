using AMWUtil.Common;
using AMWUtil.Exception;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Validation
{
    public class RemoveTokenRequestValidate : BaseEngine
    {
        protected override void ExecuteEngine()
        {
            if (ObjectUtil.IsEmptyNull(this.RequestParam.token))
                throw this.NewAMWException(AMWExceptionCode.V0003, "token");
            if (ObjectUtil.IsEmptyNull(this.RequestParam.secretKey))
                throw this.NewAMWException(AMWExceptionCode.V0003, "secretKey");
        }
    }
}
