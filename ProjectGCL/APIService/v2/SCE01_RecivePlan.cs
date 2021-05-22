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

namespace ProjectGCL.APIService.v2
{
    public class SCE01_RecivePlan : AWMSEngine.APIService.BaseAPIService
    {
        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            TREQ_Recieve_Plan request = ObjectUtil.DynamicToModel<TREQ_Recieve_Plan>(this.RequestVO);
            Engine.v2.ReceivePlanEngine exec = new Engine.v2.ReceivePlanEngine();
            return exec.Execute(this.Logger, this.BuVO, request);
        }

    }
}
