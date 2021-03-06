using AMWUtil.Common;
using AWMSEngine.Engine.V2.Business.Auditor;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService.V2.Business.Audit
{
    public class GetSTOAuditAPI : BaseAPIService
    {
        public GetSTOAuditAPI(AWMSEngine.Controllers.V2.BaseController controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            var req = ObjectUtil.DynamicToModel<GetSTOAudit.TReq>(this.RequestVO);
            var res = new GetSTOAudit().Execute(this.Logger, this.BuVO, req);

            return res;
        }
    }
}
