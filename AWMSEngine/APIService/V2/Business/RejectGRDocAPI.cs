
using AMWUtil.Common;
using AWMSEngine.Engine.V2.Business.Received;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.V2.Business
{
    public class RejectGRDocAPI : BaseAPIService
    { 
        public RejectGRDocAPI(AWMSEngine.Controllers.V2.BaseController controllerAPI,int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }
        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = ObjectUtil.DynamicToModel<RejectedGRDocument.TDocReq>(this.RequestVO);
            var res = new RejectedGRDocument().Execute(this.Logger, this.BuVO, req);

            return res;
        }
    }
}
