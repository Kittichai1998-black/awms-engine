using AMWUtil.Common;
using AWMSEngine.Controllers.V2;
using AWMSEngine.Engine.V2.Business.MaintenancePlan;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService.V2.Maintenance
{
    public class AddMaintenanceDetailAPI : BaseAPIService
    {
        public AddMaintenanceDetailAPI(BaseController controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            var req = ObjectUtil.DynamicToModel<AddMaintenanceItem.TReq>(this.RequestVO);
            var res = new AddMaintenanceItem().Execute(this.Logger, this.BuVO, req);
            return res;
        }
    }
}
