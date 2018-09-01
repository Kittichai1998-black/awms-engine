using AMWUtil.Common;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.APIService.Doc
{
    public class ReceivedDocumentCreateAPI : BaseAPIService
    {
        public ReceivedDocumentCreateAPI(ControllerBase controllerAPI) : base(controllerAPI)
        {
        }

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
