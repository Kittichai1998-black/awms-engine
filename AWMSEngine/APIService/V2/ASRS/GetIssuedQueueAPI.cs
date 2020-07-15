using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWMSEngine.Controllers.V2;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.V2.ASRS
{
    public class GetIssuedQueueAPI : BaseAPIService
    {

        public GetIssuedQueueAPI(BaseController controllerAPI, int apiSeriveID, bool isAuthenAuthorize = true) : base(controllerAPI, apiSeriveID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            throw new NotImplementedException();
        }
    }
}
