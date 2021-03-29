using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWMSEngine.Engine.V2.Business.WorkQueue;
using AWMSEngine.Engine.V2.Business.Document;
using ADO.WMSStaticValue;
using AWMSEngine.Controllers.V2;
using AMSModel.Criteria.API;

namespace AWMSEngine.APIService.V2.ASRS
{
    
    public class DoneWorkQueueAPI : BaseAPIService
    {
        public DoneWorkQueueAPI(BaseController controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            WMReq_DoneWQ req = AMWUtil.Common.ObjectUtil.DynamicToModel<WMReq_DoneWQ>(this.RequestVO);
            var resDoneQ = new DoneWorkQueue().Execute(this.Logger, this.BuVO, req);
            new WorkedDocument().Execute(this.Logger, this.BuVO, new WorkedDocument.TReq() { docIDs = resDoneQ.docIDs });
            this.CommitTransaction();
            return resDoneQ;
        }
         
    }
}
