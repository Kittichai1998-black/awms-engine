﻿using AMWUtil.Common;
using AWMSEngine.Engine.Business.Picking;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService.WM
{
    public class SelectPickingAPI : BaseAPIService
    {
        public override int APIServiceID()
        {
            return 84;
        }
        public SelectPickingAPI(ControllerBase controllerAPI, bool isAuthenAuthorize = true) : base(controllerAPI, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            var req = ObjectUtil.DynamicToModel<SelectPalletPicking.TReq>(this.RequestVO);
            var res = new SelectPalletPicking().Execute(this.Logger, this.BuVO, req);

            return res;
        }
    }
}