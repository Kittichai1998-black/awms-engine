using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWMSEngine.Engine.Business.WorkQueue;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.ASRS
{
    public class WorkingStageQueueAPI : BaseAPIService
    {
        public WorkingStageQueueAPI(ControllerBase controllerAPI) : base(controllerAPI)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = AMWUtil.Common.ObjectUtil.DynamicToModel<UpdateQueueEvent.TReq>(this.RequestVO);
            var res = new UpdateQueueEvent().Execute(this.Logger, this.BuVO, req);
            return res;
        }
    }
}
