using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWMSEngine.Engine.V2.Business;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.V2.Business
{
    public class BaseStoInfoAPI : BaseAPIService
    {
        public BaseStoInfoAPI(ControllerBase controllerAPI,int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            string palletCode = this.RequestVO.PalletCode;
            var baseStoInfo = new BaseStoInfo();
            var res = baseStoInfo.Execute(this.Logger, this.BuVO, palletCode);
            return res;
        }
    }
}
