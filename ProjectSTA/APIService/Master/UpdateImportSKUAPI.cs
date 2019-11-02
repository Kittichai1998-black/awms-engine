using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using Microsoft.AspNetCore.Mvc;
using ProjectSTA.Engine.Business;

namespace ProjectSTA.APIService.Master
{
    public class UpdateImportSKUAPI : AWMSEngine.APIService.BaseAPIService
    {
        public UpdateImportSKUAPI(ControllerBase controllerAPI,int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = ObjectUtil.DynamicToModel<UpdateImportSKU.TDocReq >(this.RequestVO);
            var res = new UpdateImportSKU().Execute(this.Logger, this.BuVO, req);

            return res;
        }
    }
}
