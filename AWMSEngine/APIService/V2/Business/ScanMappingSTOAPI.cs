using AMWUtil.Common;
using AWMSEngine.Engine.V2.Business.Received;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService.V2.Business
{
    public class ScanMappingSTOAPI : BaseAPIService
    {
        public ScanMappingSTOAPI(AWMSEngine.Controllers.V2.BaseController controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }
        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = ObjectUtil.DynamicToModel<ScanMappingSTO.TReq>(this.RequestVO);
            var res = new ScanMappingSTO().Execute(this.Logger, this.BuVO, req);

            return res;
        }
    }
    
}
