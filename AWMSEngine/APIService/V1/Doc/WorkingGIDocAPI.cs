using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.Doc
{
    public class WorkingGIDocAPI : BaseAPIService
    {
        public override int APIServiceID()
        {
            return 46;
        }
        public WorkingGIDocAPI(ControllerBase controllerAPI, bool isAuthenAuthorize = true) : base(controllerAPI, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            var req = ObjectUtil.DynamicToModel<Engine.Business.Issued.WorkingGIDocument.TDocReq>(this.RequestVO);
            var res = new Engine.Business.Issued.WorkingGIDocument().Execute(this.Logger, this.BuVO, req);
            return res;
        }
    }
}
