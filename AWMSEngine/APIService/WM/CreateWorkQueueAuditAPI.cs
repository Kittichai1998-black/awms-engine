using AMWUtil.Common;
using AWMSEngine.Engine.Business.Auditor;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService.WM
{
    public class CreateWorkQueueAuditAPI : BaseAPIService
    {
        public override int APIServiceID()
        {
            return 66;
        }
        public CreateWorkQueueAuditAPI(ControllerBase controllerAPI) : base(controllerAPI)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = ObjectUtil.DynamicToModel<CreateWorkQueueAudit.TReq>(this.RequestVO);
            var res = new CreateWorkQueueAudit().Execute(this.Logger, this.BuVO, req);

            return res;
        }
    }
}
