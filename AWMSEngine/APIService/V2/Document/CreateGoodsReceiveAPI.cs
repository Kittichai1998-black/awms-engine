using AMWUtil.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWMSEngine.Engine.V2.Business.Document;

namespace AWMSEngine.APIService.V2.Document
{
    public class CreateGoodsReceiveAPI : BaseAPIService
    {
        public CreateGoodsReceiveAPI(AWMSEngine.Controllers.V2.BaseController controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var reqDoc = ObjectUtil.DynamicToModel<CreateGoodsReceive.TReq>(this.RequestVO);
            var res = new CreateGoodsReceive().Execute(
                this.Logger,
                this.BuVO,
                reqDoc);
            return res;
        }
    }
}
