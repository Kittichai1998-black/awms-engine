using AWMSEngine.APIService;
using Microsoft.AspNetCore.Mvc;
using ProjectSTA.Engine.Business.Received;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectSTA.APIService.WM
{
    public class RemoveFromPalletRecievedAPI : BaseAPIService
    {
        public RemoveFromPalletRecievedAPI(ControllerBase controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var reqVO = AMWUtil.Common.ObjectUtil.DynamicToModel<RemoveFromPalletRecieve.TReq>(this.RequestVO);
            return new RemoveFromPalletRecieve().Execute(this.Logger, this.BuVO, reqVO);
        }
    }
}
