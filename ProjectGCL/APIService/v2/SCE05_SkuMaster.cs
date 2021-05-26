using AWMSEngine.Controllers.V2;
using ProjectGCL.Engine.v2;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectGCL.APIService.v2
{
    public class SCE05_SkuMaster : AWMSEngine.APIService.BaseAPIService
    {
        public SCE05_SkuMaster(BaseController controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            var exec = new SCE05_SkuMaster_Engine();
            var req = exec.ConverRequest(this.RequestVO);
            var res = exec.Execute(this.Logger, this.BuVO, req);
            return res;
        }
    }
}
