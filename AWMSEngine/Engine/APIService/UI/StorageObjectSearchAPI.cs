using AMWUtil.Common;
using AWMSModel.Criteria.SP.Request;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.APIService.UI
{
    public class StorageObjectSearchAPI : BaseAPIService
    {
        public StorageObjectSearchAPI(ControllerBase controllerAPI) : base(controllerAPI)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            var req = ObjectUtil.DynamicToModel<SPInSTOSearchCriteria>(this.RequestVO);
            var res = new General.STOFullSearch().Execute(this.Logger, this.BuVO, req);
            return res;
        }
    }
}
