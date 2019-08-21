using AMWUtil.Common;
using AWMSEngine.Engine.General;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService.Report
{
    public class ExportFileServerAPI : BaseAPIService
    {
        public ExportFileServerAPI(ControllerBase controllerAPI,int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            var req = ObjectUtil.DynamicToModel<ExportQueryToFileServer.TReq>(this.RequestVO);
            var res = new ExportQueryToFileServer().Execute(this.Logger, this.BuVO, req);

            return res;
        }
    }
}
