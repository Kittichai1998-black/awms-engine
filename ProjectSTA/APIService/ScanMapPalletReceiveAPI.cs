using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace ProjectSTA.APIService
{
    public class ScanMapPalletReceiveAPI : AWMSEngine.APIService.BaseAPIService
    {
        public ScanMapPalletReceiveAPI(ControllerBase controllerAPI, bool isAuthenAuthorize = false) : base(controllerAPI, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();

            return null;
        }
    }
}
