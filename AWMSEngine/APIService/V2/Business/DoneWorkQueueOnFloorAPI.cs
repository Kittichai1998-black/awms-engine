using AWMSEngine.Engine.V2.Business.Document;
using AWMSEngine.Engine.V2.Business.WorkQueue;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService.V2.Business
{
    public class DoneWorkQueueOnFloorAPI : BaseAPIService
    {
        public DoneWorkQueueOnFloorAPI(AWMSEngine.Controllers.V2.BaseController controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }


        protected override dynamic ExecuteEngineManual()
        {
            //this.BeginTransaction();
            //var req = AMWUtil.Common.ObjectUtil.DynamicToModel<WorkingWorkQueue.TReq>(this.RequestVO);
            //var res = new WorkingWorkQueue().Execute(this.Logger, this.BuVO, req);
            //this.CommitTransaction();

            this.BeginTransaction();
            DoneWorkQueueOnFloor.TReq reqDoneQ = AMWUtil.Common.ObjectUtil.DynamicToModel<DoneWorkQueueOnFloor.TReq>(this.RequestVO);
            var resDoneQ = new DoneWorkQueueOnFloor().Execute(this.Logger, this.BuVO, reqDoneQ);
            this.CommitTransaction();

            this.BeginTransaction();
            var resWorked = new WorkedDocument().Execute(this.Logger, this.BuVO, 
                new WorkedDocument.TReq() { docIDs = new List<long> { resDoneQ.docID.Value } });
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
