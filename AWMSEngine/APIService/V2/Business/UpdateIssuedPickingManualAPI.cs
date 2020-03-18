using AMWUtil.Common;
using AWMSEngine.Engine.V2.Business.Picking;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.V2.Business
{
    public class UpdateIssuedPickingManualAPI : BaseAPIService
    {
        public UpdateIssuedPickingManualAPI(ControllerBase controllerAPI,int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {

            this.BeginTransaction();
            var reqPick = ObjectUtil.DynamicToModel<UpdateIssuedPickingManual.TReq>(this.RequestVO);
            var resPick = new UpdateIssuedPickingManual().Execute(this.Logger, this.BuVO, reqPick);
            return resPick.doc;
        }
    }
}
