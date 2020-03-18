
using AMWUtil.Common;
using AWMSEngine.Engine.V2.Business.LogFile;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.V2.Business
{
    public class DownloadLogFileByRefIDAPI : BaseAPIService
    { 
        public DownloadLogFileByRefIDAPI(ControllerBase controllerAPI,int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }
        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = ObjectUtil.DynamicToModel<DownloadLogFileByRefID.TReq>(this.RequestVO);
            var res = new DownloadLogFileByRefID().Execute(this.Logger, this.BuVO, req);

            return res;
        }
    }
}
