using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AWMSEngine.APIService;
using Microsoft.AspNetCore.Mvc;
using ProjectSTA.Engine.Business;
using ProjectSTA.Engine.Business.Received;

namespace ProjectSTA.APIService.WM   
{
    public class UpdateQCStatusAPI : BaseAPIService
    {
        public UpdateQCStatusAPI(ControllerBase controllerAPI,int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = ObjectUtil.DynamicToModel<UpdateQCStatus.TReq>(this.RequestVO);
            var res = new UpdateQCStatus().Execute(this.Logger, this.BuVO, req);
            return res;
        }
    }
}
