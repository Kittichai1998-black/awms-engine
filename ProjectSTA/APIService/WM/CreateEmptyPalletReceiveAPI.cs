using AMWUtil.Common;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ProjectSTA.Engine.Business.Received;

namespace ProjectSTA.APIService.WM
{
    public class CreateEmptyPalletReceiveAPI : AWMSEngine.APIService.BaseAPIService
    {
        public override int APIServiceID()
        {
            return 92;
        }
        public CreateEmptyPalletReceiveAPI(ControllerBase controllerAPI, bool isAuthenAuthorize = true) : base(controllerAPI, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = ObjectUtil.DynamicToModel<EmptyPalletReceive.TReq>(this.RequestVO);
            var res = new EmptyPalletReceive().Execute(this.Logger, this.BuVO, req);
            return res;
        }
    }
}
