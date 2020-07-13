using AWMSEngine.APIService;
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
    public class PostAlertMessageAPI : BaseAPIService
    {
        public PostAlertMessageAPI(BaseController controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            WMSAlert.TReq req = AMWUtil.Common.ObjectUtil.DynamicToModel<WMSAlert.TReq>(this.RequestVO);
            var res = new WMSAlert().Execute(this.Logger, this.BuVO, req);
            var hub = this.ControllerAPI;
            hub.CommonMsgHub.Clients.All.SendAsync("alert", res);
            return null;

        }
    }
}
