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
        public ScanConsoToLoadingAPI(ControllerBase controllerAPI) : base(controllerAPI)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = ObjectUtil.DynamicToModel<ScanConsoToLoading.TReq>(this.RequestVO);
            var res = new ScanConsoToLoading().Execute(this.Logger, this.BuVO, req);
            return res;
        }
    }
}
