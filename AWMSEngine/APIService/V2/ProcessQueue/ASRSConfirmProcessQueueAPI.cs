using AWMSEngine.Engine.V2.Business.WorkQueue;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService.V2.ProcessQueue
{
    public class ASRSConfirmProcessQueueAPI : BaseAPIService
    {
        public ASRSConfirmProcessQueueAPI(AWMSEngine.Controllers.V2.BaseController controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = AMWUtil.Common.ObjectUtil.DynamicToModel<ASRSConfirmProcessQueue.TReq>(this.RequestVO);
            var res = new ASRSConfirmProcessQueue().Execute(this.Logger, this.BuVO, req);
            //this.RollbackTransaction();
            return res;
        }
    }
}
