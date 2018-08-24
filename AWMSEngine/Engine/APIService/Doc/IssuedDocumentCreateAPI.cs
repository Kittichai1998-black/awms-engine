using AMWUtil.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.APIService.Doc
{
    public class IssuedDocumentCreateAPI : BaseAPIService
    {
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
