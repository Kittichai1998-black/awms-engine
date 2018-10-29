using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AWMSEngine.Engine.Business.Issued;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.WM
{
    public class ListAreaLocationCanPickingAPI : BaseAPIService
    {
        public ListAreaLocationCanPickingAPI(ControllerBase controllerAPI) : base(controllerAPI)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            var req = new ListAreaLocationCanPicking.TReq();
            string docItemIDs = this.RequestVO.docItemIDs;
            req.docItemIDs = docItemIDs.Split(',').Select(x => x.Get<long>()).ToList<long>();
            var res = new Engine.Business.Issued.ListAreaLocationCanPicking()
                .Execute(this.Logger, this.BuVO, req);
            return res;
        }
    }
}
