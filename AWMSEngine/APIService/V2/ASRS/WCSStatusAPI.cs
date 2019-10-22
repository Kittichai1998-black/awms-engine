﻿using AWMSEngine.APIService;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using AWMSEngine.HubService;
using AWMSEngine.Controllers.V2;
using AWMSEngine.Engine.V2.General;

namespace AWMSEngine.APIService.V2.ASRS
{
    public class WCSStatusAPI : BaseAPIService
    {
        public WCSStatusAPI(ControllerBase controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            WCSStatus.TReq req = AMWUtil.Common.ObjectUtil.DynamicToModel<WCSStatus.TReq>(this.RequestVO);
            var res = new WCSStatus().Execute(this.Logger, this.BuVO, req);
            var hub = (BaseV2Controller)this.ControllerAPI;
            hub.HubService.Clients.All.SendAsync("alert", res);
            //var hub2 = this.BuVO.Hub;
            //hub2.Clients.All.SendAsync("alert", "test=xyz");
            return null;

        }
    }
}
