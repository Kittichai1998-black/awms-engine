using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWMSEngine.Engine.V2.Business.WorkQueue;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.V2.ASRS
{
    public class EnquiryWorkQueueAPI : BaseAPIService
    {
        public EnquiryWorkQueueAPI(AWMSEngine.Controllers.V2.BaseController controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = AMWUtil.Common.ObjectUtil.DynamicToModel<EnquiryWorkQueue.TReq>(this.RequestVO);
            var engine = new EnquiryWorkQueue();
            var res = engine.Execute(this.Logger, this.BuVO, req);
            return res;
        }
    }
}
