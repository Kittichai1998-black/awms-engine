using AWMSEngine.Engine.General;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.Mst
{
    public class PutSKUMasterAPI : BaseAPIService
    {
        public PutSKUMasterAPI(ControllerBase controllerAPI) : base(controllerAPI)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            List<ams_SKUMaster> req1 = ObjectUtil.DynamicToModel<ams_SKUMaster>(this.RequestVO);

            var res = new MasterPut<ams_SKUMaster>().Execute(this.Logger, this.BuVO, null);

            return res;
        }
    }
}
