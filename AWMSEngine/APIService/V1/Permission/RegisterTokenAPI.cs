﻿using AWMSEngine.Engine.General;
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
    public class RegisterTokenAPI : BaseAPIService
    {
        public override int APIServiceID()
        {
            return 58;
        }
        public RegisterTokenAPI(ControllerBase controllerAPI) : base(controllerAPI, false)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            new RegisterTokenRequestValidate().Execute(this.Logger, this.BuVO, null);
            
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