using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWMSEngine.Engine.V2.General;

namespace AWMSEngine.APIService.V2.Data
{
    public class GetRootLogFileAPI : BaseAPIService
    {
        public GetRootLogFileAPI(ControllerBase controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var resLogDirectory = new GetRootLogFile().Execute(this.Logger, this.BuVO, null);
            //this.CommitTransaction();
            return resLogDirectory;
        }
    }
}
