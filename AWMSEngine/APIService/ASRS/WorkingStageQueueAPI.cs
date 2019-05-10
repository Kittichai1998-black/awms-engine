﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWMSEngine.Engine.Business.WorkQueue;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.ASRS
{
    public class WorkingStageQueueAPI : BaseAPIService
    {
        public override int APIServiceID()
        {
            return 26;
        }
        public WorkingStageQueueAPI(ControllerBase controllerAPI, bool isAuthenAuthorize = true) : base(controllerAPI, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = AMWUtil.Common.ObjectUtil.DynamicToModel<WorkingStageQueue.TReq>(this.RequestVO);
            var res = new WorkingStageQueue().Execute(this.Logger, this.BuVO, req);
            return res;
        }
    }
}
