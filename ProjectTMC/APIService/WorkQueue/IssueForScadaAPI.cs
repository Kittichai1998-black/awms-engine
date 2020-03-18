using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using Microsoft.AspNetCore.Mvc;
using ProjectTMC.Engine.WorkQueue;

namespace ProjectTMC.APIService.WorkQueue
{
    public class IssueForScadaAPI : AWMSEngine.APIService.BaseAPIService
    {
        public IssueForScadaAPI(ControllerBase controllerAPI,int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = ObjectUtil.DynamicToModel<IssueForScada.TReq >(this.RequestVO);
            var res = new IssueForScada().Execute(this.Logger, this.BuVO, req);

            return res;
        }
    }
}
