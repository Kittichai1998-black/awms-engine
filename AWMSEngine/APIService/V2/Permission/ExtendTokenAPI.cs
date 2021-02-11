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
    public class ExtendTokenAPI : BaseAPIService
    {
        public ExtendTokenAPI(AWMSEngine.Controllers.V2.BaseController controllerAPI, int apiServiceID = 0) : base(controllerAPI, apiServiceID, false)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            //new Validation.RemoveTokenRequestValidate().Execute(this.Logger, this.BuVO);

            var res1 = new ExtendToken().Execute(this.Logger, this.BuVO,
                new ExtendToken.TReqModel()
                {
                    Token = this.RequestVO.token
                });

            return res1;
        }
    }
}
