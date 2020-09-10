using AMWUtil.Common;
using AWMSEngine.Controllers.V2;
using AWMSEngine.Engine.V2.Business.MaintenancePlan;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService.V2.Maintenance
{
    public class GetMaintenanceItemAPI : BaseAPIService
    {
        public GetMaintenanceItemAPI(BaseController controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            GetMaintenanceDetail.TReq req = ObjectUtil.DynamicToModel<GetMaintenanceDetail.TReq>(this.RequestVO);
            var res = new GetMaintenanceDetail().Execute(this.Logger, this.BuVO, req);
            return res;
        }
    }
}
