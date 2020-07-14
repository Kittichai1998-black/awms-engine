
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.V2.Business
{
    public class RejectedLDDocAPI : BaseAPIService
    {
        public RejectedLDDocAPI(AWMSEngine.Controllers.V2.BaseController controllerAPI,int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            //this.BeginTransaction();
            //var req = ObjectUtil.DynamicToModel<RejectedGIDocumnet.TReq>(this.RequestVO);
            //var res = new RejectedGIDocumnet().Execute(this.Logger, this.BuVO, req);

            return null;
        }
    }
}
