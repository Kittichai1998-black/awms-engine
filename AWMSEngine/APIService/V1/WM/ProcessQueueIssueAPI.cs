using AMWUtil.Common;
using AWMSEngine.Engine.Business.Issued;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService.Doc
{
    public class ProcessQueueIssueAPI : BaseAPIService
    {
        public ProcessQueueIssueAPI(ControllerBase controllerAPI,int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var reqDoc = ObjectUtil.DynamicToModel<ProcessQueueIssue.TReq>(this.RequestVO);
            var res = new ProcessQueueIssue().Execute(
                this.Logger,
                this.BuVO,
                reqDoc);
            return res;
        }
    }
}