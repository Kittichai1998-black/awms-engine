using AMWUtil.Common;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ProjectTAP.Engine.Business.Received;

namespace ProjectTAP.APIService.WM
{
    public class WCSMapBaseRegisterAPI : AWMSEngine.APIService.BaseAPIService
    {
        public WCSMapBaseRegisterAPI(ControllerBase controllerAPI, bool isAuthenAuthorize = true) : base(controllerAPI, isAuthenAuthorize)
        {
        }

        public override int APIServiceID()
        {
            return 91;
        }

        protected override dynamic ExecuteEngineManual()
        {
            //this.BeginTransaction();
            //var req = ObjectUtil.DynamicToModel<WCSMapBaseRegister.TReq>(this.RequestVO);
            //var res = new WCSMapBaseRegister().Execute(this.Logger, this.BuVO, req);
            //return res;
            throw new Exception("No Code");
        }

    }
}
