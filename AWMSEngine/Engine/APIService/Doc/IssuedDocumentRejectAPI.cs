using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AWMSEngine.Engine.Business;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.Engine.APIService.Doc
{
    public class IssuedDocumentRejectAPI : BaseAPIService
    {
        public IssuedDocumentRejectAPI(ControllerBase controllerAPI) : base(controllerAPI)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = ObjectUtil.DynamicToModel<DocGoodsIssuedRejected.TDocReq>(this.RequestVO);
            var res = new Engine.Business.DocGoodsIssuedRejected().Execute(this.Logger, this.BuVO, req);

            return res;
        }
    }
}
