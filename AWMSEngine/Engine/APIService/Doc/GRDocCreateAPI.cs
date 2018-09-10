using AMWUtil.Common;
using AWMSEngine.Engine.Business.Received;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.APIService.Doc
{
    public class GRDocCreateAPI : BaseAPIService
    {
        public GRDocCreateAPI(ControllerBase controllerAPI) : base(controllerAPI)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var reqDoc = AMWUtil.Common.ObjectUtil.DynamicToModel<GRDocCreate.TReq>(this.RequestVO);
            var res = new GRDocCreate().Execute(
                this.Logger,
                this.BuVO,
                reqDoc);
            return res;
        }
    }
}
