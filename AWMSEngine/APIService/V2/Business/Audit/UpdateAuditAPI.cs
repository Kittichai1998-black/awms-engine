using AMWUtil.Common;
using AWMSEngine.Engine.Business.Auditor;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService.V2.Business.Audit
{
    public class UpdateAuditAPI : BaseAPIService
    {
        public UpdateAuditAPI(AWMSEngine.Controllers.V2.BaseController controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = ObjectUtil.DynamicToModel<UpdateAudit.TReq>(this.RequestVO);
            var res = new UpdateAudit().Execute(this.Logger, this.BuVO, req);

            return res;
        }
    }
}
