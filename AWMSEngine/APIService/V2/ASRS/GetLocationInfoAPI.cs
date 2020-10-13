using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Exception;
using ADO.WMSStaticValue;
using AWMSEngine.Engine.V2.General;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.V2.ASRS
{
    public class GetLocationInfoAPI : BaseAPIService
    {

        public GetLocationInfoAPI(AWMSEngine.Controllers.V2.BaseController controllerAPI,int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
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
