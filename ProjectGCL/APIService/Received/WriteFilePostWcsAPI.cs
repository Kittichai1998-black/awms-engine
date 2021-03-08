using AMWUtil.Common;
using AWMSEngine.APIService;
using ProjectGCL.Engine.Document;
using ProjectGCL.Engine.WorkQueue;

namespace ProjectGCL.APIService.Received 
{ 
    public class WriteFilePostWcsAPI : BaseAPIService
    {
        public WriteFilePostWcsAPI(AWMSEngine.Controllers.V2.BaseController controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }
        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = ObjectUtil.DynamicToModel<WriteFilePostWcs.TReq>(this.RequestVO);
            var res = new WriteFilePostWcs().Execute(this.Logger, this.BuVO, req);
            this.CommitTransaction();

            return res;
        }
    }
}
