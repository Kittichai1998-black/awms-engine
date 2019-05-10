using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AWMSEngine.Engine.Business;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.WM
{
    public class GetMapSTOInDocAPI : BaseAPIService
    {
        public override int APIServiceID()
        {
            return 69;
        }
        public GetMapSTOInDocAPI(ControllerBase controllerAPI, bool isAuthenAuthorize = true) : base(controllerAPI, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            var req = ObjectUtil.DynamicToModel<GetMapSTOInDocument.TReq>(this.RequestVO);
            var res = new GetMapSTOInDocument().Execute(this.Logger, this.BuVO, req);

            return res;
        }
    }
}
