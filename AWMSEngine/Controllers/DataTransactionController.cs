using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AWMSEngine.APIService.Data;
using AWMSEngine.APIService.UI;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.Controllers
{
    [Route("api/trx")]
    [ApiController]
    public class DataTransactionController : ControllerBase
    {
        [HttpGet]
        public dynamic GetData()
        {
            var qrystr = this.Request.QueryString.Value.Replace("?", "");
            var jsond = ObjectUtil.QueryStringToObject(qrystr);
            //{"token":"","apiKey":"","t":"",pk:"","datas":[{"test":"xx"}]}
            var api = new SelectDataTrxAPI(this);
            var res = api.Execute(jsond);

            return res;
        }
        [HttpGet("sto/search")]
        public dynamic SearchSTO()
        {
            var req = AMWUtil.Common.ObjectUtil.QueryStringToObject(this.Request.QueryString.Value);
            var res = new STOSearchAPI(this).Execute(req);
            return res;
        }
    }
}