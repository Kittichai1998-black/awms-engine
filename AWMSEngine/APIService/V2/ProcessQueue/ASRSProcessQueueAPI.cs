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
        public ASRSProcessQueueAPI(ControllerBase controllerAPI, bool isAuthenAuthorize = true) : base(controllerAPI, isAuthenAuthorize)
        {
        }

        public override int APIServiceID()
        {
            return 100;
        }

        protected override dynamic ExecuteEngineManual()
        {
            var req = AMWUtil.Common.ObjectUtil.DynamicToModel<ASRSProcessQueue.TReq>(this.RequestVO);
            var res = new ASRSProcessQueue().Execute(this.Logger, this.BuVO, req);

            return res;
        }
    }
}
