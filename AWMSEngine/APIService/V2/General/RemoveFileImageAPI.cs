using AWMSEngine.Engine.V2.General;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService.V2.General
{
    public class RemoveFileImageAPI : BaseAPIService
    {

        public RemoveFileImageAPI(AWMSEngine.Controllers.V2.BaseController controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }
        protected override dynamic ExecuteEngineManual()
        {
            var req = AMWUtil.Common.ObjectUtil.DynamicToModel<RemoveFileImage.TReq>(this.RequestVO);
            var res = new RemoveFileImage().Execute(this.Logger, this.BuVO, req);
            return res;
        }
    }
}
