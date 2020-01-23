using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWMSEngine.Engine.V2.Business.WorkQueue;
using AWMSEngine.Engine.V2.Business.Document;

namespace AWMSEngine.APIService.V2.ASRS
{
    
    public class DoneQueueAPI : BaseAPIService
    {
        public DoneQueueAPI(ControllerBase controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            DoneQ.TReq req = AMWUtil.Common.ObjectUtil.DynamicToModel<DoneQ.TReq>(this.RequestVO);
            var resDoneQ = new DoneQ().Execute(this.Logger, this.BuVO, req);
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
