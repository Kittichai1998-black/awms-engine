using AWMSEngine.APIService;
using AWMSEngine.Controllers.V2;
using ProjectBOSS.Engine.Audit;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectBOSS.APIService
{
    public class AuditNotifyAPI : BaseAPIService
    {
        public AuditNotifyAPI(BaseController controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            var audit = new AuditNotify();
            var res = audit.Execute(this.Logger, BuVO, null);
            return res;
        }
    }
}
