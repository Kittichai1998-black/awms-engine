using AMWUtil.Common;
using AWMSEngine.Engine.V2.Business.Picking;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService.V2.Business
{
    public class GetSTOPickingAPI : BaseAPIService
    {
        public GetSTOPickingAPI(AWMSEngine.Controllers.V2.BaseController controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            var req = ObjectUtil.DynamicToModel<GetSTOPicking.TReq>(this.RequestVO);
            var res = new GetSTOPicking().Execute(this.Logger, this.BuVO, req);

            return res;
        }
    }
}
