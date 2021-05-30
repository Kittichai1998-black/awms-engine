using ADO.WMSStaticValue;
using ADO.WMSDB;
using AMSModel.Constant.EnumConst;
using AMSModel.Entity;
using AMWUtil.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMSModel.Criteria;
using AMSModel.Criteria.SP.Response;
using ProjectGCL.GCLModel.Criterie;
using AWMSEngine.Controllers.V2;

namespace ProjectGCL.APIService.v2
{
    public class SCE01_RecivePlan : AWMSEngine.APIService.BaseAPIService
    {
        public SCE01_RecivePlan(BaseController controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            TREQ_Recieve_Plan request = ObjectUtil.DynamicToModel<TREQ_Recieve_Plan>(this.RequestVO);
            Engine.v2.SCE01_CreateReceivePlan_Engine exec = new Engine.v2.SCE01_CreateReceivePlan_Engine();
            var res = exec.Execute(this.Logger, this.BuVO, request);
            return res;
        }

    }
}
