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
        public ASRSConfirmProcessQueueAPI(ControllerBase controllerAPI, bool isAuthenAuthorize = true) : base(controllerAPI, isAuthenAuthorize)
        {
        }

        public override int APIServiceID()
        {
            return 101;
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
