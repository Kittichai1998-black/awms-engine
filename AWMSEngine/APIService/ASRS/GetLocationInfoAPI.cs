using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Exception;
using AWMSEngine.ADO.StaticValue;
using AWMSEngine.Engine.General;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.ASRS
{
    public class GetLocationInfoAPI : BaseAPIService
    {
        public GetLocationInfoAPI(ControllerBase controllerAPI) : base(controllerAPI)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            var req = AMWUtil.Common.ObjectUtil.DynamicToModel<CheckEmptyLocation.TReq>(this.RequestVO);
            var res = new CheckEmptyLocation().Execute(this.Logger, this.BuVO, req);

            return res;
        }
    }
}
