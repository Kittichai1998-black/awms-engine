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
        public CloseDocumentJobAPI(ControllerBase controllerAPI, bool isAuthenAuthorize = false) : base(controllerAPI, isAuthenAuthorize)
        {
        }

        public override int APIServiceID()
        {
            return 88;
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
