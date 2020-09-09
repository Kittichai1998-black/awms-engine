using AMWUtil.Common;
using AWMSEngine.Engine.Business.Auditor;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService.V2.Business.Audit
{
    public class SelectAuditAPI : BaseAPIService
    {
        public SelectAuditAPI(AWMSEngine.Controllers.V2.BaseController controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            string palletCode = this.RequestVO.palletCode;
            var res = new SelectAudit().Execute(this.Logger, this.BuVO, palletCode);

            return res;
        }
    }
}
