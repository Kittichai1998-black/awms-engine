using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.Doc
{
    public class GIDocWorkingAPI : BaseAPIService
    {
        public GIDocWorkingAPI(ControllerBase controllerAPI) : base(controllerAPI)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            var req = ObjectUtil.DynamicToModel<Engine.Business.Issued.GIDocWorking.TDocReq>(this.RequestVO);
            var res = new Engine.Business.Issued.GIDocWorking().Execute(this.Logger, this.BuVO, req);
            return res;
        }
    }
}
