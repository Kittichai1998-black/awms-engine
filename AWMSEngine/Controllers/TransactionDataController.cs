using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.Controllers
{
    [Route("api/trx")]
    [ApiController]
    public class TransactionDataController : ControllerBase
    {
        [HttpGet]
        public dynamic GetData()
        {
            var qrystr = this.Request.QueryString.Value.Replace("?", "");
            var jsond = ObjectUtil.QueryStringToObject(qrystr);
            //{"token":"","apiKey":"","t":"",pk:"","datas":[{"test":"xx"}]}
            var api = new AWMSEngine.Engine.APIService.Data.SelectDataTrxAPI();
            var res = api.Execute(jsond);

            return res;
        }
    }
}