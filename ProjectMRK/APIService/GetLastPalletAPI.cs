using AWMSEngine.APIService;
using Microsoft.AspNetCore.Mvc;
using ProjectMRK.Engine.Business.WorkQueue;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectMRK.APIService
{
    public class GetLastPalletAPI : BaseAPIService
    {
        public GetLastPalletAPI(ControllerBase controllerAPI,int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
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
