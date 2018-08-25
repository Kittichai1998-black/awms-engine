using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.APIService.WM
{
    public class PickingListAPI : BaseAPIService
    {
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
