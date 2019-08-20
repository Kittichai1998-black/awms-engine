using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.Engine.Business;
using AWMSEngine.Engine.Business.Issued;
using AWMSEngine.Engine.Business.Loading;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Entity;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.WM
{
    public class ScanConsoToLoadingAPI : BaseAPIService
    {
        public ScanConsoToLoadingAPI(ControllerBase controllerAPI,int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = ObjectUtil.DynamicToModel<LoadedStoByScanConso.TReq>(this.RequestVO);
            var res = new LoadedStoByScanConso().Execute(this.Logger, this.BuVO, req);
            return res;
        }
    }
}
