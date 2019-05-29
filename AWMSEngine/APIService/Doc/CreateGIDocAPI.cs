using AMWUtil.Common;
using AWMSEngine.Engine.V2.Business.Received;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService.Doc
{
    public class CreateGIDocAPI : BaseAPIService
    {
        public override int APIServiceID()
        {
            return 37;
        }
        public CreateGIDocAPI(ControllerBase controllerAPI, bool isAuthenAuthorize = true) : base(controllerAPI, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var reqDoc = ObjectUtil.DynamicToModel<CreateGRDocumentV2.TReq>(this.RequestVO);
            var res = new CreateGRDocumentV2().Execute(
                this.Logger,
                this.BuVO,
                reqDoc);
            return res;
        }
    }
}
