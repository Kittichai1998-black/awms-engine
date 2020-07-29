using AWMSEngine.Controllers.V2;
using AWMSEngine.Engine.V2.Develop;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService.V2.General
{
    public class DevManagementAPI : BaseAPIService
    {
        public DevManagementAPI(BaseController controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            var req = AMWUtil.Common.ObjectUtil.DynamicToModel<DevManagement.TReq>(this.RequestVO);
            var res = new DevManagement().Execute(this.Logger, this.BuVO, req);
            return res;
        }
    }
}
