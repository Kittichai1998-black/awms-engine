using AWMSEngine.APIServiceCustom;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.CustomAPIService
{
    public class DownloadLogFileAPI : BaseAPIServiceCustom
    {
        public DownloadLogFileAPI(ControllerBase controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        private class TReqModel
        {
            public string path;
            public string search;
        }

        protected override dynamic ExecuteEngineManual()
        {
            TReqModel req = AMWUtil.Common.ObjectUtil.DynamicToModel<TReqModel>(this.RequestVO);

            if (string.IsNullOrEmpty(req.path))
                throw new Exception("path can't empty");
            if (!req.path.EndsWith(".log"))
                throw new Exception("can dowload *.log only");

            var stream = AMWUtil.Common.FileUtil.findstr(req.path, req.search);
            string fileName = req.search + "." + DateTime.Now.ToString("yyyyMMdd_hhmmss") + ".log";
            return this.ControllerAPI.File(stream, "application/octet-stream", fileName);
        }
    }
}
