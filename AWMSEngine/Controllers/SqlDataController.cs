using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace AWMSEngine.Controllers
{
    [Produces("application/json")]
    [Route("api/[controller]")]
    public class SqlDataController : Controller
    {
        [HttpPut("insupd")]
        public dynamic InsUpdData([FromBody]dynamic request)
        {
            //{"token":"","apiKey":"","t":"",pk:"","datas":[{"test":"xx"}]}
            var api = new AWMSEngine.Engine.APIService.Data.InsUpdDataAPI();
            var res = api.Execute(request);
            
            return res;
        }
    }
}