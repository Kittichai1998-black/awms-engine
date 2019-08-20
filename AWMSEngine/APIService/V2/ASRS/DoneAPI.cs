using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWMSEngine.Engine.V2.Business.WorkQueue;

namespace AWMSEngine.APIService.V2.ASRS
{
    
    public class DoneAPI : BaseAPIService
    {
        public DoneAPI(ControllerBase controllerAPI,int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }
        public class TReq
        {
            public DoneQ.TReq data;
            public List<long> docIDs;
        }
        public class TRes
        {
            public List<long> docIDs;
        }
        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            DoneQ.TReq req = AMWUtil.Common.ObjectUtil.DynamicToModel<DoneQ.TReq>(this.RequestVO);
            var resDoneQ = new DoneQ().Execute(this.Logger, this.BuVO, req);
            this.CommitTransaction();

            this.BeginTransaction();
            List<long> reqWorked = AMWUtil.Common.ObjectUtil.DynamicToModel<List<long>>(resDoneQ);
            var resWorked = new WorkedDocument().Execute(this.Logger, this.BuVO, new TReq() { data = req, docIDs = reqWorked });
            this.CommitTransaction();

            this.BeginTransaction();
            List<long> reqClosing = AMWUtil.Common.ObjectUtil.DynamicToModel<List<long>>(resWorked);
            var resClosing = new ClosingDocument().Execute(this.Logger, this.BuVO, new TReq() { data = req, docIDs = reqClosing });
            this.CommitTransaction();
            
            this.BeginTransaction();
            List<long> reqClosed = AMWUtil.Common.ObjectUtil.DynamicToModel<List<long>>(resClosing);
            var resClosed = new ClosedDocument().Execute(this.Logger, this.BuVO, new TReq() { data = req, docIDs = reqClosed });
            this.CommitTransaction();

            return null;
        }
         
    }
}
