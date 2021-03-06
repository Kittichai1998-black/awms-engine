using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AWMSEngine.Engine.Business.Issued;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.Doc
{
    public class CloseGIDocAPI : BaseAPIService
    {
        public CloseGIDocAPI(ControllerBase controllerAPI,int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = ObjectUtil.DynamicToModel<ClosingGIDocument.TDocReq>(this.RequestVO);
            var res = new ClosingGIDocument().Execute(this.Logger, this.BuVO, req);
            this.CommitTransaction();


            this.BeginTransaction();
            var reqSAP = ObjectUtil.DynamicToModel<ClosedGIDocument.TDocReq>(this.RequestVO);
            var resSAP = new ClosedGIDocument().Execute(this.Logger, this.BuVO, reqSAP);
            return resSAP;
            
        }
    }
}
