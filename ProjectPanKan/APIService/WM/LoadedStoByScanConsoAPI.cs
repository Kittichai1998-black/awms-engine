using AMWUtil.Common;
using AWMSEngine.APIService;
using AWMSModel.Criteria;
using Microsoft.AspNetCore.Mvc;
using ProjectPanKan.Engine.Business;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectPanKan.APIService.WM
{
    public class LoadedStoByScanConsoAPI : BaseAPIService
    {
        public LoadedStoByScanConsoAPI(ControllerBase controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            var req = ObjectUtil.DynamicToModel<LoadedStoByScanConso.TReq>(this.RequestVO);
            var res = new LoadedStoByScanConso().Execute(this.Logger, this.BuVO, req);

            return res;
        }
    }
}
