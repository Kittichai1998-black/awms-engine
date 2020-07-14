
using AMWUtil.Common;
using AWMSEngine.Engine.V2.Business;
using AWMSEngine.Engine.V2.Business.Received;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.V2.Business
{
    public class ScanMapStoFromDocAPI : BaseAPIService
    { 
        public ScanMapStoFromDocAPI(AWMSEngine.Controllers.V2.BaseController controllerAPI,int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }
        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = ObjectUtil.DynamicToModel<ScanMapSTOFromDoc.TReq>(this.RequestVO);
            var res = new ScanMapSTOFromDoc().Execute(this.Logger, this.BuVO, req);

            return res;
        }
    }
}
