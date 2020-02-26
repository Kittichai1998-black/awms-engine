using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWMSEngine.Engine.V2.General;

namespace AWMSEngine.APIService.V2.Data
{
    public class GetFileLogAPI : BaseAPIService
    {
        public class TReq
        {
            public string path;
        }
        public GetFileLogAPI(ControllerBase controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {

            GetFileLogAPI.TReq req = AMWUtil.Common.ObjectUtil.DynamicToModel<GetFileLogAPI.TReq>(this.RequestVO);
            this.BeginTransaction();
            var resString = new GetLogFile().Execute(this.Logger, this.BuVO, req.path);
            //this.CommitTransaction();
            return resString;
        }
    }
}