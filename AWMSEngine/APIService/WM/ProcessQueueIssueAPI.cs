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
        public ProcessQueueIssueAPI(ControllerBase controllerAPI) : base(controllerAPI)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var reqDoc = ObjectUtil.DynamicToModel<ProcessQueueIssue.TDocReq>(this.RequestVO);
            var res = new ProcessQueueIssue().Execute(
                this.Logger,
                this.BuVO,
                reqDoc);
            return res;
        }
    }
}