using AMWUtil.Common;
using AWMSEngine.Engine.Business.Auditor;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService.WM
{
    public class SelectAuditAPI : BaseAPIService
    {
        public override int APIServiceID()
        {
            return 83;
        }
        public SelectAuditAPI(ControllerBase controllerAPI, bool isAuthenAuthorize = true) : base(controllerAPI, isAuthenAuthorize)
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
