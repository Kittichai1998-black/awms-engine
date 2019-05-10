using AMWUtil.Common;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ProjectTAP.Engine.Business.Received;

namespace ProjectTAP.APIService.WM
{
    public class ScanBoxReceiveWCSAPI : AWMSEngine.APIService.BaseAPIService
    {
        public ScanBoxReceiveWCSAPI(ControllerBase controllerAPI, bool isAuthenAuthorize = true) : base(controllerAPI, isAuthenAuthorize)
        {
        }

        public override int APIServiceID()
        {
            return 91;
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = ObjectUtil.DynamicToModel<ScanBoxReceiveWCS.TReq>(this.RequestVO);
            var res = new ScanBoxReceiveWCS().Execute(this.Logger, this.BuVO, req);
            return res;
        }

    }
}
