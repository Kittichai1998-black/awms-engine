using AWMSEngine.Engine.V2.Business.WorkQueue;
using Microsoft.AspNetCore.Mvc; 

namespace ProjectSTA.APIService.WM
{
    public class WCSMapBaseRegisterAPI : AWMSEngine.APIService.BaseAPIService
    {
        public override int APIServiceID()
        {
            return 92;
        }
        public WCSMapBaseRegisterAPI(ControllerBase controllerAPI, bool isAuthenAuthorize = true) : base(controllerAPI, isAuthenAuthorize)
        {
        }
        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            RegisterWorkQueue.TReq req = AMWUtil.Common.ObjectUtil.DynamicToModel<RegisterWorkQueue.TReq>(this.RequestVO);
            var res = new RegisterWorkQueue().Execute(this.Logger, this.BuVO, req);
            return res;
        }
    }
}
