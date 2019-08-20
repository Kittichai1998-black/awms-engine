using AMWUtil.Common;
using AWMSEngine.Engine.Business.Issued;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService.WM
{
    public class ConfirmQueueIssueAPI : BaseAPIService
    {
        public ConfirmQueueIssueAPI(ControllerBase controllerAPI,int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var reqDoc = ObjectUtil.DynamicToModel<ConfirmQueueIssue.TReq>(this.RequestVO);
            var res = new ConfirmQueueIssue().Execute(
                this.Logger,
                this.BuVO,
                reqDoc);
            return res;
        }
    }
}
