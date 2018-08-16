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
            var req = AMWUtil.Common.ObjectUtil.DynamicToModel<Business.DocGoodsReceivedCreate.TReq>(this.RequestVO);
            var res = new Engine.Business.DocGoodsReceivedCreate().Execute(
                this.Logger,
                this.BuVO,
                new Business.DocGoodsReceivedCreate.TReq()
                {
                    batch = this.RequestVO.batch,
                    actionTime = AMWUtil.Common.DateTimeUtil.GetDateTime(this.RequestVO.actionTime)
                });
            return res;
        }
    }
}
