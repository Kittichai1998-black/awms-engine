using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using Microsoft.AspNetCore.Mvc;
using ProjectSTA.Engine.Business.Received;

namespace ProjectSTA.APIService.WM
{
    public class ScanMapPalletReceiveAPI : AWMSEngine.APIService.BaseAPIService
    {
        public ScanMapPalletReceiveAPI(ControllerBase controllerAPI, bool isAuthenAuthorize = false) : base(controllerAPI, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = ObjectUtil.DynamicToModel<ScanMapPalletReceive.TReq>(this.RequestVO);
            var res = new ScanMapPalletReceive().Execute(this.Logger, this.BuVO, req);
            return res;
        }
    }
}
