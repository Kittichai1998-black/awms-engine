using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWMSEngine.Engine.Business;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.WM
{
    public class PickingListAPI : BaseAPIService
    {
        public PickingListAPI(ControllerBase controllerAPI) : base(controllerAPI)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            var req = new PackingListGet.TReq()
            {

            };
            var res = new Engine.Business.PackingListGet().Execute(this.Logger, this.BuVO, req);
            return res;
        }
    }
}
