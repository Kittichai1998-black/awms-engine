using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.ASRS
{
    public class GetIssuedQueueAPI : BaseAPIService
    {

        public GetIssuedQueueAPI(ControllerBase controllerAPI, int apiSeriveID, bool isAuthenAuthorize = true) : base(controllerAPI, apiSeriveID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            throw new NotImplementedException();
        }
    }
}
