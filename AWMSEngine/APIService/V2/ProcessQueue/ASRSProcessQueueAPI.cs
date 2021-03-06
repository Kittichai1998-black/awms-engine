using AWMSEngine.Controllers.V2;
using AWMSEngine.Engine.V2.Business.WorkQueue;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService.V2.ProcessQueue
{
    public class ASRSProcessQueueAPI : BaseAPIService
    {
        public ASRSProcessQueueAPI(BaseController controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            var req = AMWUtil.Common.ObjectUtil.DynamicToModel<ASRSProcessQueue.TReq>(this.RequestVO);
            var res = new ASRSProcessQueue().Execute(this.Logger, this.BuVO, req);

            return res;
        }
    }
}
