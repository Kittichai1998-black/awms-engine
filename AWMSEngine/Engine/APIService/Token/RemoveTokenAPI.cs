using AWMSEngine.Engine.Validation;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.APIService.Token
{
    public class RemoveTokenAPI : BaseAPIService
    {
        public RemoveTokenAPI(ControllerBase controllerAPI) : base(controllerAPI)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            new Validation.RemoveTokenRequestValidate().Execute(this.Logger, this.BuVO, null);

            var res1 = new General.RemoveToken().Execute(this.Logger, this.BuVO,
                new General.RemoveToken.TReqModel()
                {
                    Token = this.RequestVO.token,
                    SecretKey = this.RequestVO.secretKey
                });

            return res1;
        }
    }
}
