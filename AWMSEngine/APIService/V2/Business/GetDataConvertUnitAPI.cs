
using AMWUtil.Common;
using AWMSEngine.Engine.Business;
using AWMSEngine.Engine.V2.Business;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.V2.Business
{
    public class GetDataConvertUnitAPI : BaseAPIService
    { 
        public GetDataConvertUnitAPI(AWMSEngine.Controllers.V2.BaseController controllerAPI,int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }
        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = ObjectUtil.DynamicToModel<GetDataConvertUnit.TReq>(this.RequestVO);
            var res = new GetDataConvertUnit().Execute(this.Logger, this.BuVO, req);

            return res;
        }
    }
}
