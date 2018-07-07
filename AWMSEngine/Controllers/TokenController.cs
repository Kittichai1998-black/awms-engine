 using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using AMWUtil.Common;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace AWMSEngine.Controllers
{
    [Produces("application/json")]
    [Route("api/[controller]")]
    public class TokenController : Controller
    {
        [HttpPost("register")]  
        public dynamic RegisterToken([FromBody] dynamic request)
        {
            var api = new AWMSEngine.Engine.APIService.Token.RegisterTokenAPI();
            var res = api.Execute(request);
            return res;
        }

        [HttpDelete("remove")]
        public dynamic RemoveToken([FromBody] dynamic request)
        {
            var api = new AWMSEngine.Engine.APIService.Token.RemoveTokenAPI();
            var res = api.Execute(request);
            return res;
        }

        [HttpGet("enquiry")]
        public dynamic EnquiryToken()
        {
            var qrystr = this.Request.QueryString.Value.Replace("?", "");
            var jsond = ObjectUtil.QueryStringToObject(qrystr);
            var api = new AWMSEngine.Engine.APIService.Token.EnquiryTokenAPI();
            var res = api.Execute(jsond);

            return res;
        }

        [HttpPut("extend")]
        public dynamic ExtendToken([FromBody] dynamic request)
        {
            var api = new AWMSEngine.Engine.APIService.Token.ExtendTokenAPI();
            var res = api.Execute(request);

            return res;
        }
    }
}