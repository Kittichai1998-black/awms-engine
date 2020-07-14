using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.V2.Common
{
    public class LoadStaticValueAPI : BaseAPIService
    {
        public LoadStaticValueAPI(AWMSEngine.Controllers.V2.BaseController controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            ADO.StaticValue.StaticValueManager.GetInstant().LoadAll();
            return null;
        }
    }
}
