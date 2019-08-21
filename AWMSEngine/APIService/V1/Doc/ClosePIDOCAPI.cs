using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AWMSEngine.Engine.Business.Auditor;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.Doc
{
    public class ClosePIDocAPI : BaseAPIService
    {
        public ClosePIDocAPI(ControllerBase controllerAPI,int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = ObjectUtil.DynamicToModel<ClosingPIDocument.TDocReq>(this.RequestVO);
            var res = new ClosingPIDocument().Execute(this.Logger, this.BuVO, req);
            this.CommitTransaction();


            this.BeginTransaction();
            var reqSAP = ObjectUtil.DynamicToModel<ClosedPIDocument.TDocReq>(this.RequestVO);
           var resSAP = new ClosedPIDocument().Execute(this.Logger, this.BuVO, reqSAP);
            return resSAP;

        }
    }
}
