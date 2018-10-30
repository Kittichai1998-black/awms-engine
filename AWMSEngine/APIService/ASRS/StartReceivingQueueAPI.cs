using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWMSEngine.Engine.Business.WorkQueue;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.ASRS
{
    public class StartReceivingQueueAPI : BaseAPIService
    {
        public StartReceivingQueueAPI(ControllerBase controllerAPI) : base(controllerAPI)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            var req = AMWUtil.Common.ObjectUtil.DynamicToModel<WorkingQueueReceiving.TReq>(this.RequestVO);
            var res = new WorkingQueueReceiving().Execute(this.Logger, this.BuVO, req);
            return res;
        }
    }
}
