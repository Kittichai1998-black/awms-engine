using AWMSEngine.APIService;
using AWMSEngine.Engine.V2.Business;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService.V2
{
    public class GetLastPalletAPI : BaseAPIService
    {
        public GetLastPalletAPI(ControllerBase controllerAPI, bool isAuthenAuthorize = true) : base(controllerAPI, isAuthenAuthorize)
        {
        }

        public override int APIServiceID()
        {
            return 111;
        }

        protected override dynamic ExecuteEngineManual()
        {
            GetLastPallet.TReq req = AMWUtil.Common.ObjectUtil.DynamicToModel<GetLastPallet.TReq>(this.RequestVO);
            this.BeginTransaction();
            var res = new GetLastPallet().Execute(this.Logger, this.BuVO, req);
            return res;
        }
    }
}
