using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AWMSEngine.Engine.Business.Auditor;
using AWMSEngine.Engine.Business.Loading;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.Doc
{
    public class CreateClosedSTCDocAPI : BaseAPIService
    {
        public CreateClosedSTCDocAPI(ControllerBase controllerAPI) : base(controllerAPI)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = ObjectUtil.DynamicToModel<CreateClosedSTCDocument.TDocReq>(this.RequestVO);
            var res = new CreateClosedSTCDocument().Execute(this.Logger, this.BuVO, req);
            return res;
        }
    }
}
