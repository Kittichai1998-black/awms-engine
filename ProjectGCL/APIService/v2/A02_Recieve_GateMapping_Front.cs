using AWMSEngine.APIService;
using AWMSEngine.Controllers.V2;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectGCL.APIService.v2
{
    public class A02_Recieve_GateMapping_Front : BaseAPIService
    {
        public A02_Recieve_GateMapping_Front(BaseController controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            Engine.v2.A02_Receive_MappingPallet2Gate_Engine exec = new Engine.v2.A02_Receive_MappingPallet2Gate_Engine();
            var req = exec.ConverRequest(this.RequestVO);
            var res = exec.Execute(this.Logger, this.BuVO, req);
            return res;
        }
    }
}
