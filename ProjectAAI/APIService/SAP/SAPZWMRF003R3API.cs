﻿using AWMSEngine.APIService;
using Microsoft.AspNetCore.Mvc;
using ProjectAAI.Engine.Business.Issued;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectAAI.APIService.SAP
{
    public class SAPZWMRF003R3API : BaseAPIService
    {
        public SAPZWMRF003R3API(ControllerBase controllerAPI, bool isAuthenAuthorize = true) : base(controllerAPI, isAuthenAuthorize)
        {
        }

        public override int APIServiceID()
        {
            return 766;
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = AMWUtil.Common.ObjectUtil.DynamicToModel<SAPZWMRF003R3.TReq>(this.RequestVO);
            var res = new SAPZWMRF003R3();
            return res.Execute(this.Logger, this.BuVO, req);
        }
    }
}
