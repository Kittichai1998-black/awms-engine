using AWMSEngine.Controllers.V2;
using AWMSEngine.Engine.V2.General;
using AWMSEngine.Engine.V2.Validation;
using AMSModel.Constant.StringConst;
using AMSModel.Criteria;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService.V2.Permission
{
    public class RemoveTokenAPI : BaseAPIService
    {
        public RemoveTokenAPI(BaseController controllerAPI, int apiServiceID = 0) : base(controllerAPI, apiServiceID, false)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            new RemoveTokenRequestValidate().Execute(this.Logger, this.BuVO, null);

            var res1 = new RemoveToken().Execute(this.Logger, this.BuVO,
                new RemoveToken.TReqModel()
                {
                    Token = this.RequestVO.token,
                    SecretKey = this.RequestVO.secretKey
                });

            return res1;
        }
    }
}
