using AMWUtil.Common;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService.Report
{
    public class GetSPReportAPI : BaseAPIService
    {
        public GetSPReportAPI(ControllerBase controllerAPI,int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            var req = ObjectUtil.DynamicToModel<Dictionary<string, string>>(this.RequestVO);
            var res = new Engine.General.GetSPReport().Execute(this.Logger, this.BuVO, req);

            return res;
        }
    }
}
