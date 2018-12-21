using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AWMSEngine.Engine.Business;
using AWMSEngine.Engine.Business.Received;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.Doc
{
    public class CloseGRDocAPI : BaseAPIService
    {
        public CloseGRDocAPI(ControllerBase controllerAPI) : base(controllerAPI)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {

            this.BeginTransaction();
            var req = ObjectUtil.DynamicToModel<ClosingGRDocSAP.TDocReq>(this.RequestVO);
            var res = new ClosingGRDocSAP().Execute(this.Logger, this.BuVO, req);
            this.CommitTransaction();

            this.BeginTransaction();
            var reqSAP = ObjectUtil.DynamicToModel<CloseGRDocument.TDocReq>(this.RequestVO);
            var resSAP = new CloseGRDocument().Execute(this.Logger, this.BuVO, reqSAP);
            return resSAP;
        }
    }
}
