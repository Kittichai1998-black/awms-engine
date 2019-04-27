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
        public override int APIServiceID()
        {
            return 89;
        }
        public CheckBaseReceivedAPI(ControllerBase controllerAPI, bool isAuthenAuthorize = true) : base(controllerAPI, isAuthenAuthorize)
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
