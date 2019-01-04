using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AWMSEngine.Engine.Business.Issued;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.Doc
{
    public class ReturnGIDocAPI : BaseAPIService
    {
        public ReturnGIDocAPI(ControllerBase controllerAPI) : base(controllerAPI)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = ObjectUtil.DynamicToModel<ReturnGIFromPicking.TDocReq>(this.RequestVO);
            var res = new ReturnGIFromPicking().Execute(this.Logger, this.BuVO, req);
            return res;

        }
    }
}
