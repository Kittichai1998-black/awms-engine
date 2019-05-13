using Microsoft.AspNetCore.Mvc;
using ProjectSTA.Engine.Business.Received;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectSTA.APIService.WM
{
    public class WCSMapBaseRegisterAPI : AWMSEngine.APIService.BaseAPIService
    {
        public override int APIServiceID()
        {
            return 92;
        }
        public WCSMapBaseRegisterAPI(ControllerBase controllerAPI, bool isAuthenAuthorize = true) : base(controllerAPI, isAuthenAuthorize)
        {
        }
        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            WCSMapBaseRegister.TReq req = AMWUtil.Common.ObjectUtil.DynamicToModel<WCSMapBaseRegister.TReq>(this.RequestVO);
            var res = new WCSMapBaseRegister().Execute(this.Logger, this.BuVO, req);
            return res;
        }
    }
}
