using AMWUtil.Common;
using AWMSEngine.Engine.Business.Issued;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.APIService.Doc
{
    public class GIDocCreateAPI : BaseAPIService
    {
        public GIDocCreateAPI(ControllerBase controllerAPI) : base(controllerAPI)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var reqDoc = ObjectUtil.DynamicToModel<GIDocCreate.TDocReq>(this.RequestVO);
            var res = new GIDocCreate().Execute(
                this.Logger,
                this.BuVO,
                reqDoc);
            return res;
        }
    }
}
