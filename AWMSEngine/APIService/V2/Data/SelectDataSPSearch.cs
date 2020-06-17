using AMWUtil.Common;
using AWMSEngine.Engine.V2.General;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService.V2.Data
{
    public class SelectDataSPSearch : BaseAPIService
    {
        public SelectDataSPSearch(ControllerBase controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            var req = ObjectUtil.DynamicToModel<Dictionary<string, string>>(this.RequestVO);
            var res = new GetSPSearch().Execute(this.Logger, this.BuVO, req);

            return res;
        }
    }
}
