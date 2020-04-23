using AWMSEngine.Engine.V2.Business.WorkQueue;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService.V2.ProcessQueue
{
    public class ManualDoneQueueAPI : BaseAPIService
    {
        public ManualDoneQueueAPI(ControllerBase controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            var req = AMWUtil.Common.ObjectUtil.DynamicToModel <ADO.QueueApi.WCSQueueADO.TReqCheckQueue> (this.RequestVO);
            var res = new ManualDoneQueue().Execute(this.Logger, this.BuVO, req);

            return res;
        }
    }
}
