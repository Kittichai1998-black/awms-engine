using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AWMSEngine.APIService.Doc;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.Controllers.WM
{
    [Route("api/loading")]
    [ApiController]
    public class LoadingController : ControllerBase
    {
        [HttpGet("doc")]
        public dynamic GetDocument()
        {
            dynamic req = ObjectUtil.QueryStringToObject(this.Request.QueryString.Value);
            return null;
        }
        [HttpPost("doc")]
        public dynamic CreateDocument([FromBody]dynamic req)
        {
            return null;
        }
        [HttpPost("doc/working")]
        public dynamic WorkingDocument([FromBody]dynamic req)
        {
            WorkingGIDocAPI exec = new WorkingGIDocAPI(this);
            var res = exec.Execute(req);
            return res;
        }
        [HttpPost("doc/reject")]
        public dynamic RejectDocument([FromBody]dynamic req)
        {
            RejectedGIDocAPI exec = new RejectedGIDocAPI(this);
            var res = exec.Execute(req);
            return res;
        }
        [HttpPost("conso")]
        public dynamic PostConsolidate([FromBody]dynamic req)
        {
            return null;
        }
        [HttpGet("conso")]
        public dynamic GetConsolidate()
        {
            dynamic req = ObjectUtil.QueryStringToObject(this.Request.QueryString.Value);
            return null;
        }
    }
}