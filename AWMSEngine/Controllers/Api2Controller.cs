using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.Controllers
{
    [ApiController]
    public class Api2Controller : ControllerBase
    {
        [HttpPost("api2/mst/material")]
        public dynamic PutMaterial([FromBody]dynamic request)
        {
            APIService.Api2.PutMaterialAPI exec = new APIService.Api2.PutMaterialAPI(this);
            return exec.Execute(request);
        }

        [HttpPost("api2/wm/receive/doc")]
        public dynamic CreateReceiveDoc([FromBody]dynamic request)
        {
            APIService.Api2.CreateReceiveAPI exec = new APIService.Api2.CreateReceiveAPI(this);
            return exec.Execute(request);
        }

        [HttpPost("api2/wm/issue/doc")]
        public dynamic CreateIssueDoc([FromBody]dynamic request)
        {
            APIService.Api2.CreateIssueAPI exec = new APIService.Api2.CreateIssueAPI(this);
            return exec.Execute(request);
        }

        [HttpPost("api2/wm/count/doc")]
        public dynamic CreateAuditDoc([FromBody]dynamic request)
        {
            APIService.Api2.CreateAuditAPI exec = new APIService.Api2.CreateAuditAPI(this);
            return exec.Execute(request);
        }

        [HttpPost("api/wm/issue/doc/check")]
        public dynamic CheckForUpdateIssue([FromBody]dynamic request)
        {
            AWMSEngine.APIService.API2.CheckForUpdateIssueAPI exec = new APIService.API2.CheckForUpdateIssueAPI(this);
            return exec.Execute(request);
        }
    }
}