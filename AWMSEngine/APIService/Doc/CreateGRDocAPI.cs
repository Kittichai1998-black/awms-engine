using AMWUtil.Common;
using AWMSEngine.Engine.Business.Received;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService.Doc
{
    public class CreateGRDocAPI : BaseAPIService
    {
        public override int APIServiceID()
        {
            return 38;
        }
        public CreateGRDocAPI(ControllerBase controllerAPI) : base(controllerAPI)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var reqDoc = AMWUtil.Common.ObjectUtil.DynamicToModel<CreateGRDocument.TReq>(this.RequestVO);
            var res = new CreateGRDocument().Execute(
                this.Logger,
                this.BuVO,
                reqDoc);
            return res;
        }
    }
}
