using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWMSEngine.APIService.Report;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.Controllers
{
    [Route("api/report")]
    [ApiController]
    public class ReportController : ControllerBase
    {
        [HttpPost("export/fileServer")]
        public dynamic ExportFileServer([FromBody]dynamic data)
        {
            //var req = AMWUtil.Common.ObjectUtil.QueryStringToObject("exportName=exportName");
            var res = new ExportFileServerAPI(this).Execute(data);
            return res;
        }
        [HttpGet("sp")]
        public dynamic GetSPReport()
        {
            var req = AMWUtil.Common.ObjectUtil.QryStrToDynamic(this.Request.QueryString.Value);
            var res = new GetSPReportAPI(this).Execute(req);
            return res;
        }

    }
}