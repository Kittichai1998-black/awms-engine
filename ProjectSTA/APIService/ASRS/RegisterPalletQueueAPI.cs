using Microsoft.AspNetCore.Mvc;
using ProjectSTA.Engine.Business.WorkQueue;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectSTA.APIService.ASRS
{
    public class RegisterPalletQueueAPI : AWMSEngine.APIService.BaseAPIService
    {
        public override int APIServiceID()
        {
            return 92;
        }
        public RegisterPalletQueueAPI(ControllerBase controllerAPI, bool isAuthenAuthorize = true) : base(controllerAPI, isAuthenAuthorize)
        {
        }
        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            RegisterQueueReceiving.TReq req = AMWUtil.Common.ObjectUtil.DynamicToModel<RegisterQueueReceiving.TReq>(this.RequestVO);
            var res = new RegisterQueueReceiving().Execute(this.Logger, this.BuVO, req);
            return res;
        }
    }
}
