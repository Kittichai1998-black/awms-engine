
using AMWUtil.Common;
using AWMSEngine.Engine.V2.Business;
using AWMSEngine.Engine.V2.Business.Received;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.V2.Business
{
    public class ScanMapStoAPI : BaseAPIService
    { 
        public ScanMapStoAPI(ControllerBase controllerAPI,int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }
        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = ObjectUtil.DynamicToModel<ScanMapStoNoDoc.TReq>(this.RequestVO);
            var res = new ScanMapStoNoDoc().Execute(this.Logger, this.BuVO, req);

            return res;
        }
    }
}
