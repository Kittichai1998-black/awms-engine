﻿using AMWUtil.Common;
using AWMSEngine.Engine.Business.Auditor;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService.WM
{
    public class UpdateAuditAPI : BaseAPIService
    {
        public UpdateAuditAPI(ControllerBase controllerAPI) : base(controllerAPI)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = ObjectUtil.DynamicToModel<UpdateAudit.TReq>(this.RequestVO);
            var res = new UpdateAudit().Execute(this.Logger, this.BuVO, req);

            return res;
        }
    }
}