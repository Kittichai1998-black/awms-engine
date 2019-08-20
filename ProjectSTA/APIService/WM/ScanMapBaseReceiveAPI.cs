using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using Microsoft.AspNetCore.Mvc;
using ProjectSTA.Engine.Business.Received;

namespace ProjectSTA.APIService.WM   
{
    public class ScanMapBaseReceiveAPI : AWMSEngine.APIService.BaseAPIService
    {
        public ScanMapBaseReceiveAPI(ControllerBase controllerAPI,int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = ObjectUtil.DynamicToModel<ScanMapBaseReceive.TReq>(this.RequestVO);
            var res = new ScanMapBaseReceive().Execute(this.Logger, this.BuVO, req);
            return res;
        }
    }
}
