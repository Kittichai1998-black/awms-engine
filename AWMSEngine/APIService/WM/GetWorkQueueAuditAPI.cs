using AMWUtil.Common;
using AWMSEngine.Engine.Business.Auditor;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService.WM
{
    public class GetWorkQueueAuditAPI : BaseAPIService
    {
        public override int APIServiceID()
        {
            return 71;
        }
        public GetWorkQueueAuditAPI(ControllerBase controllerAPI) : base(controllerAPI)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = ObjectUtil.DynamicToModel<GetWorkQueueAudit.TReq>(this.RequestVO);
            var res = new GetWorkQueueAudit().Execute(this.Logger, this.BuVO, req);

            return res;
        }
    }
}
