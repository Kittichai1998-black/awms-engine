using AWMSEngine.Engine.Business.Issued;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService.WM
{
    public class ReturnInventoryByGIDocumentAPI : BaseAPIService
    {
        public override int APIServiceID()
        {
            return 78;
        }
        public ReturnInventoryByGIDocumentAPI(ControllerBase controllerAPI, bool isAuthenAuthorize = true) : base(controllerAPI, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            var req = AMWUtil.Common.ObjectUtil.DynamicToModel<ReturnInventoryByGIDocument.TReq>(this.RequestVO);
            var res = new ReturnInventoryByGIDocument().Execute(this.Logger, this.BuVO, req);
            return res;
        }
    }
}
