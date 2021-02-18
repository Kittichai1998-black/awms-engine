using AMWUtil.Common;
using AWMSEngine.APIService;
using ProjectGCL.Engine.Document;

namespace ProjectGCL.APIService.Document
{
    public class DeleteDocByCodeAPI : BaseAPIService
    {
        public DeleteDocByCodeAPI(AWMSEngine.Controllers.V2.BaseController controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }
        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = ObjectUtil.DynamicToModel<DeleteDocByCode.TReq>(this.RequestVO);
            var res = new DeleteDocByCode().Execute(this.Logger, this.BuVO, req);
            this.CommitTransaction();

            return res;
        }
    }
}
