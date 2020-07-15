using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService.V2.Notify
{
    public class GetNotifyAPI : BaseAPIService
    {
        public GetNotifyAPI(AWMSEngine.Controllers.V2.BaseController controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            var req = AMWUtil.Common.ObjectUtil.DynamicToModel<Engine.V2.Notification.GetNotify.TReq>(this.RequestVO);
            var notify = new Engine.V2.Notification.GetNotify();
            return notify.Execute(this.Logger, this.BuVO, req);
        }
    }
}
