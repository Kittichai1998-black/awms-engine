﻿using AWMSEngine.Engine.Business.WorkQueue;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService.ASRS
{
    public class EnquiryQueueAPI : BaseAPIService
    {
        public EnquiryQueueAPI(ControllerBase controllerAPI) : base(controllerAPI)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = AMWUtil.Common.ObjectUtil.DynamicToModel<EnquiryQueue.TReq>(this.RequestVO);
            var res = new EnquiryQueue().Execute(this.Logger, this.BuVO, req);
            return res;
        }
    }
}