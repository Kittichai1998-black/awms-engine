using AMWUtil.Common;
using AWMSEngine.APIService;
using ProjectGCL.Engine.Document;

namespace ProjectGCL.APIService.Document
{
    public class CreateDocReceiveListAPI : BaseAPIService
    {
        public CreateDocReceiveListAPI(AWMSEngine.Controllers.V2.BaseController controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }
        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = ObjectUtil.DynamicToModel<CreateDocReceiveList.TReq>(this.RequestVO);
            var res = new CreateDocReceiveList().Execute(this.Logger, this.BuVO, req);
            this.CommitTransaction();

            return res;
        }
    }
}
