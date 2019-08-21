using AMWUtil.Common;
using AWMSEngine.Engine.Business.Picking;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService.WM
{
    public class SelectPickingAPI : BaseAPIService
    {
        public SelectPickingAPI(ControllerBase controllerAPI,int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            var req = ObjectUtil.DynamicToModel<SelectPalletPicking.TReq>(this.RequestVO);
            var res = new SelectPalletPicking().Execute(this.Logger, this.BuVO, req);

            return res;
        }
    }
}
