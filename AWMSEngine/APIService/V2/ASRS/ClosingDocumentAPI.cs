using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWMSEngine.Engine.V2.Business.WorkQueue;

namespace AWMSEngine.APIService.V2.ASRS
{
    
    public class ClosingDocumentAPI : BaseAPIService
    {
        public override int APIServiceID()
        {
            return 97;
        }

        public ClosingDocumentAPI(ControllerBase controllerAPI, bool isAuthenAuthorize = true) : base(controllerAPI, isAuthenAuthorize)
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
