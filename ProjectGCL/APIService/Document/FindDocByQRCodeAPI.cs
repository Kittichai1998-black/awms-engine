using AMWUtil.Common;
using AWMSEngine.APIService;
using ProjectGCL.Engine.Document;

namespace ProjectGCL.APIService.Document
{
    public class FindDocByQRCodeAPI : BaseAPIService
    {
        public FindDocByQRCodeAPI(AWMSEngine.Controllers.V2.BaseController controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }
        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = ObjectUtil.DynamicToModel<FindDocByQRCode.TReq>(this.RequestVO);
            var res = new FindDocByQRCode().Execute(this.Logger, this.BuVO, req);
            this.CommitTransaction();
            return res;
        }
    }
}
