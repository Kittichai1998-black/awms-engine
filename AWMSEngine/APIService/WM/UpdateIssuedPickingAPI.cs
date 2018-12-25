using AMWUtil.Common;
using AWMSEngine.Engine.Business.Picking;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService.WM
{
    public class UpdateIssuedPickingAPI : BaseAPIService
    {
        public UpdateIssuedPickingAPI(ControllerBase controllerAPI) : base(controllerAPI)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = ObjectUtil.DynamicToModel<UpdateIssuedPicking.TReq>(this.RequestVO);
            var res = new UpdateIssuedPicking().Execute(this.Logger, this.BuVO, req);

            return res;
        }
    }
}
