using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using Microsoft.AspNetCore.Mvc;
using ProjectAERP.Engine.Document;

namespace ProjectAERP.APIService.Document
{
    public class CreateDocGIByLNAPI : AWMSEngine.APIService.BaseAPIService
    {
        public CreateDocGIByLNAPI(ControllerBase controllerAPI,int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = ObjectUtil.DynamicToModel<CreateDocGIByLN.TReq >(this.RequestVO);
            var res = new CreateDocGIByLN().Execute(this.Logger, this.BuVO, req);

            return res;
        }
    }
}
