using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWMSEngine.APIService;
using Microsoft.AspNetCore.Mvc;
using ProjectMRK.Engine.JobService;

namespace ProjectMRK.APIService
{
    public class ReadXMLFileAPI : BaseAPIService
    {
        public ReadXMLFileAPI(ControllerBase controllerAPI, bool isAuthenAuthorize = false) : base(controllerAPI, isAuthenAuthorize)
        {
        }

        public override int APIServiceID()
        {
            return 91;
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            ReadFileXML xml = new ReadFileXML();
            var res = xml.Execute(this.Logger, this.BuVO, "");
            return res;
        }
    }
}
