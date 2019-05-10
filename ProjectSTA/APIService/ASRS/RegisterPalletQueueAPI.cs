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
            RegisterQueueReceiving2.TReq req = AMWUtil.Common.ObjectUtil.DynamicToModel<RegisterQueueReceiving2.TReq>(this.RequestVO);
            var res = new RegisterQueueReceiving2().Execute(this.Logger, this.BuVO, req);
            return res;
        }
    }
}
