using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AWMSEngine.Engine.APIService.Doc;
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
            IssuedDocumentCreateAPI exec = new IssuedDocumentCreateAPI(this);
            var res = exec.Execute(req);
            return res;
        }
    }
}