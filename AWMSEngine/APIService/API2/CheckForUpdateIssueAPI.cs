using AWMSEngine.Engine.Business.Issued;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService.API2
{
    public class CheckForUpdateIssueAPI : BaseAPIService
    {

        public override int APIServiceID()
        {
            return 11;
        }
        public CheckForUpdateIssueAPI(ControllerBase controllerAPI, bool isAuthenAuthorize = true) : base(controllerAPI, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = AMWUtil.Common.ObjectUtil.DynamicToModel<UpdateGIDocumentBeforProcessQueue.TReq>(this.RequestVO);
            var res = new UpdateGIDocumentBeforProcessQueue().Execute(this.Logger, this.BuVO, req);
            return res;
        }
    }
}
