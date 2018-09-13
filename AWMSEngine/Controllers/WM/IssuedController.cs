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
    [Route("api/wm/issued")]
    [ApiController]
    public class IssuedController : ControllerBase
    {
        [HttpGet("doc")]
        public dynamic Get()
        {
            var req = ObjectUtil.QueryStringToObject(this.Request.QueryString.Value);
            return null;
        }
        [HttpPost("doc")]
        public dynamic Post([FromBody] dynamic req)
        {
            GIDocCreateAPI exec = new GIDocCreateAPI(this);
            var res = exec.Execute(req);
            return res;
        }
        [HttpPost("doc/reject")]
        public dynamic Reject([FromBody] dynamic req)
        {
            GIDocRejectAPI exec = new GIDocRejectAPI(this);
            var res = exec.Execute(req);
            return res;
        }
        [HttpPost("doc/picking")]
        public dynamic Picking([FromBody] dynamic req)
        {
            GIDocPickingAPI exec = new GIDocPickingAPI(this);
            var res = exec.Execute(req);
            return res;
        }
    }
}