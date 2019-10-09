using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AWMSEngine.Engine.Business;
using AWMSEngine.Engine.Business.Issued;
using AWMSEngine.Engine.V2.Business.Loading;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.V2.Business
{
    public class CreateLDDocAPI : BaseAPIService
    {
        public CreateLDDocAPI(ControllerBase controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            var req = ObjectUtil.DynamicToModel<CreateLDDocument.TDocReq>(this.RequestVO);
            var res = new CreateLDDocument().Execute(this.Logger, this.BuVO, req);
            return res;
        }
    }
}

