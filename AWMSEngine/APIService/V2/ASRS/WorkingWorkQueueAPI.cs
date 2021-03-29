﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMSModel.Criteria.API;
using AWMSEngine.Engine.V2.Business.WorkQueue;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.V2.ASRS
{
    public class WorkingWorkQueueAPI : BaseAPIService
    {
        public WorkingWorkQueueAPI(AWMSEngine.Controllers.V2.BaseController controllerAPI,int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = AMWUtil.Common.ObjectUtil.DynamicToModel<WMReq_WorkingWQ>(this.RequestVO);
            var res = new WorkingWorkQueue().Execute(this.Logger, this.BuVO, req);
            return res;
        }
    }
}
