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
    public class ExtendTokenAPI : BaseAPIService
    {
        public ExtendTokenAPI(ControllerBase controllerAPI, int apiServiceID = 0) : base(controllerAPI, apiServiceID, false)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            //new Validation.RemoveTokenRequestValidate().Execute(this.Logger, this.BuVO);

            var res1 = new ExtendToken().Execute(this.Logger, this.BuVO,
                new ExtendToken.TReqModel()
                {
                    Token = this.RequestVO.token,
                    ExtendKey = this.RequestVO.extendKey
                });

            return res1;
        }
    }
}
