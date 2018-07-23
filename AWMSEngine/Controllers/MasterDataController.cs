using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.Controllers
{
    [Route("api/mst")]
    [ApiController]
    public class MasterDataController : ControllerBase
    {
        [HttpPut]
        public dynamic PutData([FromBody]dynamic request)
        {
            //{"token":"","apiKey":"","t":"",pk:"","datas":[{"test":"xx"}]}
            var api = new AWMSEngine.Engine.APIService.Data.InsUpdDataAPI();
            var res = api.Execute(request);

            return res;
        }

        [HttpGet]
        public dynamic GetData()
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