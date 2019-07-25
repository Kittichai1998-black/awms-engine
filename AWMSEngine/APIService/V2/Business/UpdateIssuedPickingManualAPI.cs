using AMWUtil.Common;
using AWMSEngine.Engine.Business.Issued;
using AWMSEngine.Engine.V2.Business.Picking;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService.V2.Business
{
    public class UpdateIssuedPickingManualAPI : BaseAPIService
    {
        public override int APIServiceID()
        {
            return 111;
        }
        public UpdateIssuedPickingManualAPI(ControllerBase controllerAPI, bool isAuthenAuthorize = true) : base(controllerAPI, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {

            this.BeginTransaction();
            var reqPick = ObjectUtil.DynamicToModel<UpdateIssuedPickingManual.TReq>(this.RequestVO);
            var resPick = new UpdateIssuedPickingManual().Execute(this.Logger, this.BuVO, reqPick);
            return resPick.doc;
        }
    }
}
