using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.ASRS
{
    public class ResetQueueAPI : BaseAPIService
    {
        public override int APIServiceID()
        {
            return 21;
        }
        public ResetQueueAPI(ControllerBase controllerAPI) : base(controllerAPI)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            throw new NotImplementedException();
        }
    }
}
