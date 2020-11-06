using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWMSEngine.Engine.V2.Business.Received;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.V2.ASRS
{
    public class MappingPalletToLocationAPI : BaseAPIService
    {
        public MappingPalletToLocationAPI(AWMSEngine.Controllers.V2.BaseController controllerAPI,int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            MappingPalletToLocation.TReq req = AMWUtil.Common.ObjectUtil.DynamicToModel<MappingPalletToLocation.TReq>(this.RequestVO);
            var res = new MappingPalletToLocation().Execute(this.Logger, this.BuVO, req);
            return res;
        }
    }
}
