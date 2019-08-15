﻿using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWMSEngine.Engine.V2.Business.WorkQueue;

namespace AWMSEngine.APIService.V2.ASRS
{
    
    public class DoneQueueAPI : BaseAPIService
    {
        public override int APIServiceID()
        {
            return 16;
        }

        public DoneQueueAPI(ControllerBase controllerAPI, bool isAuthenAuthorize = true) : base(controllerAPI, isAuthenAuthorize)
        {
        }
         
        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            DoneQ.TReq req = AMWUtil.Common.ObjectUtil.DynamicToModel<DoneQ.TReq>(this.RequestVO);
            var resDoneQ = new DoneQ().Execute(this.Logger, this.BuVO, req);
            this.CommitTransaction();

            this.BeginTransaction();
            var resWorked = new WorkedDocument().Execute(this.Logger, this.BuVO, resDoneQ);
            this.CommitTransaction();

            this.BeginTransaction();
            var resClosing = new ClosingDocument().Execute(this.Logger, this.BuVO, resWorked);
            this.CommitTransaction();
            
            this.BeginTransaction();
            var resClosed = new ClosedDocument().Execute(this.Logger, this.BuVO, resClosing);
            this.CommitTransaction();

            return resClosed;
        }
         
    }
}