using AWMSEngine.APIService;
using AWMSEngine.Controllers.V2;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectGCL.APIService.v2
{
    public class A03_2_Picking_PLAN_Close_Front : BaseAPIService
    {
        public A03_2_Picking_PLAN_Close_Front(BaseController controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            string wms_doc = (string)this.RequestVO.wms_doc;
            var exec = new Engine.v2.A03_2_PickingPlanClosed_Engine();
            return exec.Execute(this.Logger, this.BuVO, new Engine.v2.A03_2_PickingPlanClosed_Engine.TReq() { wms_doc = wms_doc });
        }
    }
}
