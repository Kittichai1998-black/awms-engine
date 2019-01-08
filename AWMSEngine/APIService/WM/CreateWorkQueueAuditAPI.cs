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
        public CreateWorkQueueAuditAPI(ControllerBase controllerAPI) : base(controllerAPI)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            var req = ObjectUtil.DynamicToModel<CreateWorkQueueAudit.TReq>(this.RequestVO);
            var res = new CreateWorkQueueAudit().Execute(this.Logger, this.BuVO, req);

            return res;
        }
    }
}
