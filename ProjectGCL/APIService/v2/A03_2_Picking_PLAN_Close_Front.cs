using AWMSEngine.APIService;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectGCL.APIService.v2
{
    public class A03_2_Picking_PLAN_Close_Front : BaseAPIService
    {
        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            string wms_doc = (string)this.RequestVO.wms_doc;
            var exec = new Engine.v2.A03_2_PickingPlanClosedEngine();
            return exec.Execute(this.Logger, this.BuVO, new Engine.v2.A03_2_PickingPlanClosedEngine.TReq() { wms_doc = wms_doc });
        }
    }
}
