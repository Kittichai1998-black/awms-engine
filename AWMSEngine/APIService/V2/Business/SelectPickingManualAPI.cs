using AMWUtil.Common;
using AWMSEngine.Engine.V2.Business.Picking;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService.V2.Business
{
    public class SelectPickingManualAPI : BaseAPIService
    {
        public SelectPickingManualAPI(AWMSEngine.Controllers.V2.BaseController controllerAPI,int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            var req = ObjectUtil.DynamicToModel<SelectPalletManualPicking.TReq>(this.RequestVO);
            var res = new SelectPalletManualPicking().Execute(this.Logger, this.BuVO, req);

            return res;
        }
    }
}
