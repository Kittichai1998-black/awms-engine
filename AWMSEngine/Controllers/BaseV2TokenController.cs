 using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using AMWUtil.Common;
using AWMSEngine.APIService.Permission;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace AWMSEngine.Controllers
{
    [Route("v2/token")]
    [ApiController]
    public class BaseV2TokenController : Controller
    {
        [HttpPost("register")]  
        public dynamic RegisterToken([FromBody] dynamic request)
        {
            var api = new RegisterTokenAPI(this);
            var res = api.Execute(request);
            return res;
        }

        [HttpDelete("remove")]
        public dynamic RemoveToken([FromBody] dynamic request)
        {
            var api = new RemoveTokenAPI(this);
            var res = api.Execute(request);
            return res;
        }

        [HttpGet("enquiry")]
        public dynamic EnquiryToken()
        {
            var qrystr = this.Request.QueryString.Value.Replace("?", "");
            var jsond = ObjectUtil.QueryStringToObject(qrystr);
            var api = new EnquiryTokenAPI(this);
            var res = api.Execute(jsond);

            return res;
        }

        [HttpPut("extend")]
        public dynamic ExtendToken([FromBody] dynamic request)
        {
            var api = new ExtendTokenAPI(this);
            var res = api.Execute(request);

            return res;
        }
    }
}