using AWMSEngine.Engine.V2.Business.Received;
using AWMSEngine.Engine.V2.Business.WorkQueue;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService.V2.ASRS
{
    public class RegisterWorkQueueAutoAPI : BaseAPIService
    {
        public RegisterWorkQueueAutoAPI(AWMSEngine.Controllers.V2.BaseController controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = AMWUtil.Common.ObjectUtil.DynamicToModel<RegisterWorkQueue.TReq>(this.RequestVO);
            var engine = new RegisterWorkQueueAuto();
            var res = engine.Execute(this.Logger, this.BuVO, req);
            return res;
        }
    }
}
