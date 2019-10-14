using AWMSEngine.APIService;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using AWMSEngine.HubService;
using AWMSEngine.Controllers.V2;

namespace ProjectSTA.APIService.ASRS
{
    public class WCSAlertAPI : BaseAPIService
    {
        public WCSAlertAPI(ControllerBase controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            var hub = (BaseV2Controller)this.ControllerAPI;
            hub.HubService.Clients.All.SendAsync("alert", "test=xyz");
            //var hub2 = this.BuVO.Hub;
            //hub2.Clients.All.SendAsync("alert", "test=xyz");
            return null;

        }
    }
}
