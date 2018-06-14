using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

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
    }
}