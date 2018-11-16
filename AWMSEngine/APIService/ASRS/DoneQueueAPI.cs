using AWMSEngine.Engine.Business.WorkQueue;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService.ASRS
{
    public class DoneQueueAPI : BaseAPIService
    {
        public DoneQueueAPI(ControllerBase controllerAPI) : base(controllerAPI)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = AMWUtil.Common.ObjectUtil.DynamicToModel<DoneQueue.TReq>(this.RequestVO);
            var res = new DoneQueue().Execute(this.Logger, this.BuVO, req);
            return res;
        }
    }
}
