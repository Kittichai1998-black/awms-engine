using AMWUtil.Common;
using AWMSEngine.Engine.Business.Issued;
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
            var reqDoc = ObjectUtil.DynamicToModel<CreateDocument.TReq>(this.RequestVO);
            var res = new CreateDocument().Execute(
                this.Logger,
                this.BuVO,
                reqDoc);
            return res;
        }
    }
}
