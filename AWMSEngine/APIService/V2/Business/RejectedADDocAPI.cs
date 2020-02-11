using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AWMSEngine.Engine.V2.Business;
using AWMSEngine.Engine.V2.Business.Auditor;
using AWMSEngine.Engine.V2.Business.Received;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.V2.Business
{
    public class RejectedADDocAPI : BaseAPIService
    {
        public RejectedADDocAPI(ControllerBase controllerAPI,int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = ObjectUtil.DynamicToModel<RejectedADDocument.TReq>(this.RequestVO);
            var res = new RejectedADDocument().Execute(this.Logger, this.BuVO, req);

            return res;
        }
    }
}
