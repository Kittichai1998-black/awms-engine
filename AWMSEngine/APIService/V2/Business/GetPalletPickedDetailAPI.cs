using AWMSEngine.Engine.V2.Business;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService.V2.Business
{
    public class GetPalletPickedDetailAPI : BaseAPIService
    {
        public GetPalletPickedDetailAPI(AWMSEngine.Controllers.V2.BaseController controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {

        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            GetPalletPickedDetail.TReq req  = AMWUtil.Common.ObjectUtil.DynamicToModel<GetPalletPickedDetail.TReq>(this.RequestVO);
            var res = new GetPalletPickedDetail().Execute(this.Logger, this.BuVO, req);
            this.CommitTransaction();
            return res;
        }
    }
}
