using AWMSEngine.Engine.General;
using AWMSEngine.Engine.Validation;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService.Permission
{
    public class RemoveTokenAPI : BaseAPIService
    {
        public override int APIServiceID()
        {
            return 59;
        }
        public RemoveTokenAPI(ControllerBase controllerAPI) : base(controllerAPI, false)
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
