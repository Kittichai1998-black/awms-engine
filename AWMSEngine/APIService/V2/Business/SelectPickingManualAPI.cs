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
        public override int APIServiceID()
        {
            return 109;
        }
        public SelectPickingManualAPI(ControllerBase controllerAPI, bool isAuthenAuthorize = true) : base(controllerAPI, isAuthenAuthorize)
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
