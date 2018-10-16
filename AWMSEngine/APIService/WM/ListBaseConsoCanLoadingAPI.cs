using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AWMSEngine.Engine.Business.Loading;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.WM
{
    public class ListBaseConsoCanLoadingAPI : BaseAPIService
    {
        public ListBaseConsoCanLoadingAPI(ControllerBase controllerAPI) : base(controllerAPI)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            var req = ObjectUtil.DynamicToModel<ListBaseConsoCanLoading.TReq>(this.RequestVO);
            var res = new ListBaseConsoCanLoading().Execute(this.Logger, this.BuVO, req);
            return res;
        }
    }
}
