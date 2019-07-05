﻿using AWMSEngine.Engine.General;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService.Permission
{
    public class EnquiryTokenAPI : BaseAPIService
    {
        public override int APIServiceID()
        {
            return 55;
        }
        public EnquiryTokenAPI(ControllerBase controllerAPI) : base(controllerAPI, false)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            //new Validation.EnquiryTokenRequestValidate().Execute(this.Logger, this.BuVO);
            //string qry = "select * from xxx where id=? "
            var res1 = new EnquiryToken().Execute(this.Logger, this.BuVO,
                new EnquiryToken.TReqModle() { Token = this.RequestVO.token, SecretKey = this.RequestVO.secretKey });

            return res1;
        }
    }
}