using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWMSEngine.Engine.V2.Business.Received;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.ASRS
{
    public class RecieveEmptyPalletAPI : BaseAPIService
    {
        public RecieveEmptyPalletAPI(ControllerBase controllerAPI, bool isAuthenAuthorize = true) : base(controllerAPI, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            RecieveEmptyPallet.TReq req = AMWUtil.Common.ObjectUtil.DynamicToModel<RecieveEmptyPallet.TReq>(this.RequestVO);
            var res = new RecieveEmptyPallet().Execute(this.Logger, this.BuVO, null);
            return res;
        }
    }
}
