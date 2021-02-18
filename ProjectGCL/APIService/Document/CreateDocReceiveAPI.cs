using AMWUtil.Common;
using AWMSEngine.APIService;
using ProjectGCL.Engine.Document;

namespace ProjectGCL.APIService.Document
{
    public class CreateDocReceiveAPI : BaseAPIService
    {
        public CreateDocReceiveAPI(AWMSEngine.Controllers.V2.BaseController controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }
        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = ObjectUtil.DynamicToModel<CreateDocReceive.TReq>(this.RequestVO);
            var res = new CreateDocReceive().Execute(this.Logger, this.BuVO, req);
            this.CommitTransaction();

            return res;
        }
    }
}
