using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.Engine.APIService.WM
{
    public class PickingListAPI : BaseAPIService
    {
        public PickingListAPI(ControllerBase controllerAPI) : base(controllerAPI)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            var req = new Business.PackingListGet.TReq()
            {

            };
            var res = new Engine.Business.PackingListGet().Execute(this.Logger, this.BuVO, req);
            return res;
        }
    }
}
