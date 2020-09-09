using AMWUtil.Common;
using AWMSEngine.Engine.V2.Business.Counting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService.V2.Business.Couting
{
    public class GetSTOCoutingAPI : BaseAPIService
    {
        public GetSTOCoutingAPI(AWMSEngine.Controllers.V2.BaseController controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            var req = ObjectUtil.DynamicToModel<GetSTOCouting.TReq>(this.RequestVO);
            var res = new GetSTOCouting().Execute(this.Logger, this.BuVO, req);

            return res;
        }
    }
}
