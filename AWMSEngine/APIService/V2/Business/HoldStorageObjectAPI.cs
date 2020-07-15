using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AWMSEngine.Engine.Business;
using Microsoft.AspNetCore.Mvc;
namespace AWMSEngine.APIService.V2.Business
{
    public class HoldStorageObjectAPI : BaseAPIService
    {
        public HoldStorageObjectAPI(AWMSEngine.Controllers.V2.BaseController controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = ObjectUtil.DynamicToModel<UpdateEventStoReport.TDocReq>(this.RequestVO);
            var res = new UpdateEventStoReport().Execute(this.Logger, this.BuVO, req);
            return res;



        }
    }
}
