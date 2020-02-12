using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWMSEngine.Engine.V2.Business.Received;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.V2.ASRS
{
    public class PutEmptyPalletToLocationAPI : BaseAPIService
    {
        public PutEmptyPalletToLocationAPI(ControllerBase controllerAPI,int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            MapEmptyPallet.TReq req = AMWUtil.Common.ObjectUtil.DynamicToModel<MapEmptyPallet.TReq>(this.RequestVO);
            var res = new MapEmptyPallet().Execute(this.Logger, this.BuVO, req);
            return res;
        }
    }
}
