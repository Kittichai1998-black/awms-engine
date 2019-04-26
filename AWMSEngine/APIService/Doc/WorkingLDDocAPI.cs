using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.Doc
{
    public class WorkingLDDocAPI : BaseAPIService
    {
        public override int APIServiceID()
        {
            return 47;
        }
        public WorkingLDDocAPI(ControllerBase controllerAPI) : base(controllerAPI)
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
