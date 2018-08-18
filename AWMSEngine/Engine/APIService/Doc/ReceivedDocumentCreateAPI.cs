using AMWUtil.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.APIService.Doc
{
    public class ReceivedDocumentCreateAPI : BaseAPIService
    {
        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var reqDoc = AMWUtil.Common.ObjectUtil.DynamicToModel<Business.DocGoodsReceivedCreate.TReq>(this.RequestVO);
            var res = new Engine.Business.DocGoodsReceivedCreate().Execute(
                this.Logger,
                this.BuVO,
                reqDoc);
            return res;
        }
    }
}
