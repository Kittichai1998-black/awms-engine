using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AWMSEngine.Engine.Business.Received;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.Doc
{
    public class CloseGRDocAPI : BaseAPIService
    {
        public override int APIServiceID()
        {
            return 34;
        }
        public CloseGRDocAPI(ControllerBase controllerAPI, bool isAuthenAuthorize = true) : base(controllerAPI, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {

            this.BeginTransaction();
            var req = ObjectUtil.DynamicToModel<ClosingGRDocSAP.TDocReq>(this.RequestVO);
            var res = new ClosingGRDocSAP().Execute(this.Logger, this.BuVO, req);
            this.CommitTransaction();
            //return res;

            this.BeginTransaction();
            var reqSAP = ObjectUtil.DynamicToModel<ClosedGRDocument.TDocReq>(this.RequestVO);
            var resSAP = new ClosedGRDocument().Execute(this.Logger, this.BuVO, reqSAP);
            return resSAP;
        }
    }
}
