using AMWUtil.Common;
using AWMSEngine.APIService;
using AWMSEngine.Controllers.V2;
using ProjectBOTHY.Engine.WorkQueue;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectBOTHY.APIService
{
    public class ASRSProcessQueueErrorAPI : BaseAPIService
    {
        public ASRSProcessQueueErrorAPI(BaseController controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = ObjectUtil.DynamicToModel<ASRSProcessWorkQueueError.TReq>(this.RequestVO);
            var res = new ASRSProcessWorkQueueError().Execute(this.Logger, this.BuVO, req);
            return res;
        }
    }
}
