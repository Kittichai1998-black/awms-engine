using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWMSEngine.Engine.V2.Business.WorkQueue;
using AWMSEngine.Engine.V2.Business.Document;

namespace AWMSEngine.APIService.V2.ASRS
{
    
    public class DoneWorkQueueAPI : BaseAPIService
    {
        public DoneWorkQueueAPI(ControllerBase controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            DoneWorkQueue.TReq req = AMWUtil.Common.ObjectUtil.DynamicToModel<DoneWorkQueue.TReq>(this.RequestVO);
            var resDoneQ = new DoneWorkQueue().Execute(this.Logger, this.BuVO, req);
            this.CommitTransaction();

            this.BeginTransaction();
            var resWorked = new WorkedDocument().Execute(this.Logger, this.BuVO, resDoneQ.docIDs);
            this.CommitTransaction();

            this.BeginTransaction();
            var resClosing = new ClosingDocument().Execute(this.Logger, this.BuVO, resWorked);
            this.CommitTransaction();
            
            this.BeginTransaction();
            var resClosed = new ClosedDocument().Execute(this.Logger, this.BuVO, resClosing);
            this.CommitTransaction();

            return resDoneQ;
        }
         
    }
}
