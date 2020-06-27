using AWMSEngine.Engine.V2.General;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService.V2.General
{
    public class DownloadFileImageAPI : BaseAPIService
    {
       
        public DownloadFileImageAPI(ControllerBase controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }
        protected override dynamic ExecuteEngineManual()
        {
            var req = AMWUtil.Common.ObjectUtil.DynamicToModel<DownloadFileImage.TReq>(this.RequestVO);
            var res = new DownloadFileImage().Execute(this.Logger, this.BuVO, req);
            return res;
        }
    }
}
