using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using Microsoft.AspNetCore.Mvc;
using ProjectAERP.Engine.Document;

namespace ProjectAERP.APIService.Document
{
    public class CreateDocADByLNAPI : AWMSEngine.APIService.BaseAPIService
    {
        public CreateDocADByLNAPI(ControllerBase controllerAPI,int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = ObjectUtil.DynamicToModel<CreateDocADByLN.TReq >(this.RequestVO);
            var res = new CreateDocADByLN().Execute(this.Logger, this.BuVO, req);

            return res;
        }
    }
}
