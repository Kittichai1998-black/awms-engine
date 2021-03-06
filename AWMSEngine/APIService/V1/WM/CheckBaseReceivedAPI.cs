using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AWMSEngine.Engine.V2.Business.Received;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.WM
{
    public class CheckBaseReceivedAPI : BaseAPIService
    {
        public CheckBaseReceivedAPI(ControllerBase controllerAPI,int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }
        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = ObjectUtil.DynamicToModel<CheckBaseReceived.TReq>(this.RequestVO);
            var res = new CheckBaseReceived().Execute(this.Logger, this.BuVO, req);
            return res;
        }
    }
}
