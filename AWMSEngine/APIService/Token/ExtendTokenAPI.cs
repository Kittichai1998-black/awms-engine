﻿using AWMSEngine.Engine.General;
using AWMSEngine.Engine.Validation;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService.Token
{
    public class ExtendTokenAPI : BaseAPIService
    {
        public ExtendTokenAPI(ControllerBase controllerAPI) : base(controllerAPI)
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