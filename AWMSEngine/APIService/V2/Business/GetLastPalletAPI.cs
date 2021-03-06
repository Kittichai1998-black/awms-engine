using AWMSEngine.APIService;
using AWMSEngine.Engine.V2.Business;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService.V2.Business
{
    public class GetLastPalletAPI : BaseAPIService
    {
        public GetLastPalletAPI(AWMSEngine.Controllers.V2.BaseController controllerAPI,int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
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
