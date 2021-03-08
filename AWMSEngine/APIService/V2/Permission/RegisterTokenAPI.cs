using AWMSEngine.Engine.V2.General;
using AWMSEngine.Engine.V2.Validation;
using AMSModel.Constant.EnumConst;
using AMSModel.Constant.StringConst;
using AMSModel.Criteria;
using AMSModel.Entity;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService.V2.Permission
{
    public class RegisterTokenAPI : BaseAPIService
    {
        public RegisterTokenAPI(AWMSEngine.Controllers.V2.BaseController controllerAPI, int apiServiceID = 0) : base(controllerAPI, apiServiceID, false)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            //new RegisterTokenRequestValidate().Execute(this.Logger, this.BuVO, null);

            var res1 = new RegisterToken().Execute(this.Logger, this.BuVO,
                new RegisterToken.TReqModel()
                {
                    Username = this.RequestVO.username,
                    Password = this.RequestVO.password,
                    SecretKey = this.RequestVO.secretKey
                });
            return res1;
        }
    }
}
