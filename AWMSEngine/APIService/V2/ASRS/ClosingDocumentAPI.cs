using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWMSEngine.Engine.V2.Business.WorkQueue;
using AWMSEngine.Engine.V2.Business.Document;

namespace AWMSEngine.APIService.V2.ASRS
{
    
    public class ClosingDocumentAPI : BaseAPIService
    {
        public ClosingDocumentAPI(ControllerBase controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        public class TReq
        {
            public List<long> docIDs;
        }
         
        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            TReq req = AMWUtil.Common.ObjectUtil.DynamicToModel<TReq>(this.RequestVO);
            var resClosing = new ClosingDocument().Execute(this.Logger, this.BuVO, req.docIDs);
            this.CommitTransaction();
 
            return resClosing;
        }
         
    }
}
