using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
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

        [HttpGet("select")]
        public dynamic SelectData()
        {
            var qrystr = this.Request.QueryString.Value.Replace("?", "");
            var jsond = ObjectUtil.QueryStringToObject(qrystr);
            //{"token":"","apiKey":"","t":"",pk:"","datas":[{"test":"xx"}]}
            var api = new AWMSEngine.Engine.APIService.Data.SelectDataAPI();
            var res = api.Execute(jsond);

            return res;
        }
    }
}