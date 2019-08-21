using AMWUtil.Common;
using AWMSEngine.Engine.Business;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService.API2
{
    public class CheckAPI : BaseAPIService
    {
        public CheckAPI(ControllerBase controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = ObjectUtil.DynamicToModel<CheckSendToSAP.TReq>(this.RequestVO);
            var res = new CheckSendToSAP().Execute(this.Logger, this.BuVO, req);
            return res;

        }
    }
}
