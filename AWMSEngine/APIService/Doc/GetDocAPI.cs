using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AWMSEngine.Engine.V2.Business;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.Doc
{
    public class GetDocAPI : BaseAPIService
    {
        public override int APIServiceID()
        {
            return 41;
        }
        public GetDocAPI(ControllerBase controllerAPI) : base(controllerAPI)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            var req = ObjectUtil.DynamicToModel<GetDocumentByID.TReq>(this.RequestVO);
            var res = new GetDocumentByID().Execute(this.Logger, this.BuVO, req);
            return res;
        }
    }
}
