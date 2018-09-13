using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
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
            var res = new Engine.Business.Issued.ListAreaLocationCanPicking()
                .Execute(this.Logger, this.BuVO, 
                    new Engine.Business.Issued.ListAreaLocationCanPicking.TReq() {
                        docItemID =this.RequestVO.docItemID
                    });
            return res;
        }
    }
}
