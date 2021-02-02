using AMWUtil.Common;
using AWMSEngine.APIService;
using ProjectGCL.Engine.Received;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectGCL.APIService.Received
{
    public class ScanMappingandReceiveAPI : BaseAPIService
    {
        public ScanMappingandReceiveAPI(AWMSEngine.Controllers.V2.BaseController controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }
        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = ObjectUtil.DynamicToModel<ScanMappingandReceive.TReq>(this.RequestVO);
            var res = new ScanMappingandReceive().Execute(this.Logger, this.BuVO, req);
            this.CommitTransaction();
            return res;
        }
    }
}
