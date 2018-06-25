 using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
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
            var dict = HttpUtility.ParseQueryString(qrystr);
            var qrtstrDict = dict.AllKeys.ToDictionary(key => key,key => dict[key]);
            var jsons = JsonConvert.SerializeObject(qrtstrDict);
            var jsond = JsonConvert.DeserializeObject(jsons);
            
            var api = new AWMSEngine.Engine.APIService.Token.EnquiryTokenAPI();
            var res = api.Execute(jsond);

            return res;
        }
    }
}