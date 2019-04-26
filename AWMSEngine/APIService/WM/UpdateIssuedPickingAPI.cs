using AMWUtil.Common;
using AWMSEngine.Engine.Business.Issued;
using AWMSEngine.Engine.Business.Picking;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService.WM
{
    public class UpdateIssuedPickingAPI : BaseAPIService
    {
        public override int APIServiceID()
        {
            return 86;
        }
        public UpdateIssuedPickingAPI(ControllerBase controllerAPI) : base(controllerAPI)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var reqPick = ObjectUtil.DynamicToModel<UpdateIssuedPicking.TReq>(this.RequestVO);
            var resPick = new UpdateIssuedPicking().Execute(this.Logger, this.BuVO, reqPick);
            this.CommitTransaction();

            if (resPick.closeDoc != null)
            {
                this.BeginTransaction();
                var req = ObjectUtil.DynamicToModel<ClosingGIDocument.TDocReq>(resPick.closeDoc);
                var res = new ClosingGIDocument().Execute(this.Logger, this.BuVO, req);
                this.CommitTransaction();

                this.BeginTransaction();
                var reqSAP = ObjectUtil.DynamicToModel<ClosedGIDocument.TDocReq>(resPick.closeDoc);
                var resSAP = new ClosedGIDocument().Execute(this.Logger, this.BuVO, reqSAP);

            }
            return resPick.doc;
        }
    }
}
