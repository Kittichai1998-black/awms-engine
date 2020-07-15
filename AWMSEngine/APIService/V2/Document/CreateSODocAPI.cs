using AMWUtil.Common;
using AWMSEngine.Engine.V2.Business.Shipment;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService.V2.Document
{
    public class CreateSODocAPI : BaseAPIService
    {
        public CreateSODocAPI(AWMSEngine.Controllers.V2.BaseController controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var reqDoc = ObjectUtil.DynamicToModel<CreateSODocument.TReq>(this.RequestVO);
            var res = new CreateSODocument().Execute(
                this.Logger,
                this.BuVO,
                reqDoc);
            return res;
        }
    }
}
