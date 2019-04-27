using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWMSEngine.Engine.V2.Business.Received;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.ASRS
{
    public class MapEmptyPalletAPI : BaseAPIService
    {
        public override int APIServiceID()
        {
            return 90;
        }
        public MapEmptyPalletAPI(ControllerBase controllerAPI, bool isAuthenAuthorize = true) : base(controllerAPI, isAuthenAuthorize)
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
