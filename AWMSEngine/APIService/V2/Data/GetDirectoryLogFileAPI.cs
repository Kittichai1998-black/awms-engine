using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWMSEngine.Engine.V2.General;

namespace AWMSEngine.APIService.V2.Data
{
    public class GetDirectoryLogFileAPI : BaseAPIService
    {
        public class TReq {
            public string file;
        }

        public GetDirectoryLogFileAPI(AWMSEngine.Controllers.V2.BaseController controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            GetDirectoryLogFileAPI.TReq req = AMWUtil.Common.ObjectUtil.DynamicToModel<GetDirectoryLogFileAPI.TReq>(this.RequestVO);
            this.BeginTransaction();
            var resLogDirectory = new GetDirectoryLogFile().Execute(this.Logger, this.BuVO, req.file);
            //this.CommitTransaction();
            return resLogDirectory;
        }
    }
}
