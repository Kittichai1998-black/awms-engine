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

        public override int APIServiceID()
        {
            return 19;
        }
        public GetLocationInfoAPI(ControllerBase controllerAPI, bool isAuthenAuthorize = true) : base(controllerAPI, isAuthenAuthorize)
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
