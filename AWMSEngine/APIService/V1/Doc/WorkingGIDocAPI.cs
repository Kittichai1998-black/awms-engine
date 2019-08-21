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
        public WorkingGIDocAPI(ControllerBase controllerAPI,int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
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
