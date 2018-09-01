using AMWUtil.Common;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.APIService.Doc
{
    public class IssuedDocumentCreateAPI : BaseAPIService
    {
        public IssuedDocumentCreateAPI(ControllerBase controllerAPI) : base(controllerAPI)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var reqDoc = ObjectUtil.DynamicToModel<Business.DocGoodsIssuedCreate.TDocReq>(this.RequestVO);
            var res = new Engine.Business.DocGoodsIssuedCreate().Execute(
                this.Logger,
                this.BuVO,
                reqDoc);
            return res;
        }
    }
}
