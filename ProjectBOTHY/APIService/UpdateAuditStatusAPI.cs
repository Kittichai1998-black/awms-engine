using AMWUtil.Common;
using AWMSEngine.APIService;
using AWMSEngine.Controllers.V2;
using AWMSEngine.Engine.V2.Business.WorkQueue;
using ProjectBOTHY.Engine.Business.Document;
using ProjectBOTHY.Engine.WorkQueue;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectBOTHY.APIService
{
    public class UpdateAuditStatusAPI : BaseAPIService
    {
        public UpdateAuditStatusAPI(AWMSEngine.Controllers.V2.BaseController controllerAPI,int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {

            this.BeginTransaction();
            var req = AMWUtil.Common.ObjectUtil.DynamicToModel<RegisterWorkQueue.TReq>(this.RequestVO);
            var reqAudit = AMWUtil.Common.ObjectUtil.DynamicToModel<UpdateAuditStatus.TReq>(this.RequestVO);
            var resAudit = new UpdateAuditStatus().Execute(this.Logger, this.BuVO, reqAudit);
            var engine = new RegisterWorkQueueFromWMS();       
            var res = engine.Execute(this.Logger, this.BuVO, req);
            return res;
        }
    }
}
