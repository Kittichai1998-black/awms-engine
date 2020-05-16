using AMWUtil.Common;
using AWMSEngine.Engine.V2.Business.ReceivedOrder;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
namespace AWMSEngine.APIService.V2.Document
{
    public class CreateRDDocAPI : BaseAPIService
    {
        public CreateRDDocAPI(ControllerBase controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var reqDoc = ObjectUtil.DynamicToModel<CreateRDDocument.TReq>(this.RequestVO);
            var res = new CreateRDDocument().Execute(
                this.Logger,
                this.BuVO,
                reqDoc);
            return res;
        }
    }
}
