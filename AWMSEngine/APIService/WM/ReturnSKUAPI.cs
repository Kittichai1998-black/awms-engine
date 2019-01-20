using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AWMSEngine.Engine.Business.Issued;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.WM
{
    public class ReturnSKUAPI : BaseAPIService
    {
        public ReturnSKUAPI(ControllerBase controllerAPI) : base(controllerAPI)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = ObjectUtil.DynamicToModel<InsertToDocItemSto.TDocReq>(this.RequestVO);
            var res = new InsertToDocItemSto().Execute(this.Logger, this.BuVO, req);
            return res;

        }
    }
}
