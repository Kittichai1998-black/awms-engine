using AMWUtil.Common;
using AWMSEngine.Controllers.V2;
using ProjectGCL.GCLModel.Criterie;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectGCL.APIService.v2
{
    public class SCE02_PickingPlan : AWMSEngine.APIService.BaseAPIService
    {
        public SCE02_PickingPlan(BaseController controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            TREQ_Picking_Plan request = ObjectUtil.DynamicToModel<TREQ_Picking_Plan>(this.RequestVO);
            Engine.v2.SCE02_CreatePickingPlan_Engine exec = new Engine.v2.SCE02_CreatePickingPlan_Engine();
            return exec.Execute(this.Logger, this.BuVO, request);
        }
    }
}
