using AWMSEngine.APIService;
using Microsoft.AspNetCore.Mvc;
using ProjectMRK.Engine.JobService;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectMRK.APIService.Doc
{
    public class CloseDocumentJobAPI : BaseAPIService
    {
        public CloseDocumentJobAPI(ControllerBase controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            ClosedDocument xml = new ClosedDocument();
            var res = xml.Execute(this.Logger, this.BuVO, "");
            return res;
        }
    }
}
