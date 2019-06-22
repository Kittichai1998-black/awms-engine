using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AWMSEngine.Engine.Business;
using AWMSEngine.Engine.Business.Auditor;
using AWMSEngine.Engine.Business.Received;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.Doc
{
    public class RejectedADDocAPI : BaseAPIService
    {
        public override int APIServiceID()
        {
            return 42;
        }
        public RejectedADDocAPI(ControllerBase controllerAPI, bool isAuthenAuthorize = true) : base(controllerAPI, isAuthenAuthorize)
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
