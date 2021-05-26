using AMSModel.Criteria.API;
using AWMSEngine.Controllers.V2;
using AWMSEngine.Engine.V2.Business.WorkQueue;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService.V2.Business
{
    public class UpdateBaseStoLocationAPI : BaseAPIService
    {
        public UpdateBaseStoLocationAPI(BaseController controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            var req = AMWUtil.Common.ObjectUtil.DynamicToModel<WMRes_UpdateBaseStoLocation>(this.RequestVO);

            var res = new UpdateBaseStoLocation().Execute(this.Logger, this.BuVO, req);

            return res;
        }
    }
}
