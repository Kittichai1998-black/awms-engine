
using AMWUtil.Common;
using AWMSEngine.Engine.V2.Business.Received;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.V2.Business
{
    public class GeneratePalletAPI : BaseAPIService
    { 
        public GeneratePalletAPI(ControllerBase controllerAPI,int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }
        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = ObjectUtil.DynamicToModel<GeneratePallet.TReq>(this.RequestVO);
            var res = new GeneratePallet().Execute(this.Logger, this.BuVO, req);

            return res;
        }
    }
}
