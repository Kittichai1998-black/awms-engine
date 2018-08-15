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
            var res = new Engine.Business.DocGoodsIssuedCreate().Execute(
                this.Logger,
                this.BuVO,
                new Business.DocGoodsIssuedCreate.TDocReq()
                {
                    actionTime = DateTimeUtil.GetDateTime((string)this.RequestVO.actionTime),
                    //dealerID = this.RequestVO.dealerID,
                    //warehouseID = this.RequestVO.warehouseID,

                });
            return res;
        }
    }
}
