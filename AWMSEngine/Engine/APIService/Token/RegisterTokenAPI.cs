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
    public class RegisterTokenAPI : BaseAPIService
    {
        public RegisterTokenAPI(ControllerBase controllerAPI) : base(controllerAPI)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            new Validation.RegisterTokenRequestValidate().Execute(this.Logger, this.BuVO, null);
            
            var res1 = new General.RegisterToken().Execute(this.Logger, this.BuVO,
                new General.RegisterToken.TReqModel()
                {
                    Username = this.RequestVO.username,
                    Password = this.RequestVO.password,
                    SecretKey = this.RequestVO.secretKey
                });
            return res1;
        }
    }
}
