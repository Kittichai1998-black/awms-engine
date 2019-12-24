using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AWMSEngine.Engine.Business;
using AWMSEngine.Engine.Business.Issued;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.V2.Business
{
    public class WorkingGIDocAPI : BaseAPIService
    { 
        public WorkingGIDocAPI(ControllerBase controllerAPI,int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = ObjectUtil.DynamicToModel<WorkingGIDocument.TDocReq>(this.RequestVO);
            var res = new WorkingGIDocument().Execute(this.Logger, this.BuVO, req);

            return res;
        }
    }
}
