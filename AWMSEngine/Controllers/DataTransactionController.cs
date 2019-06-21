using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AWMSEngine.APIService.Data;
using AWMSEngine.APIService.WM;
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
            var jsond = ObjectUtil.QryStrToDynamic(qrystr);
            //{"token":"","apiKey":"","t":"",pk:"","datas":[{"test":"xx"}]}
            var api = new SelectDataTrxAPI(this);
            var res = api.Execute(jsond);

            return res;
        }
        [HttpGet("sto/search")]
        public dynamic SearchSTO()
        {
            var req = AMWUtil.Common.ObjectUtil.QryStrToDynamic(this.Request.QueryString.Value);
            var res = new SearchStorageObjectAPI(this).Execute(req);
            return res;
        }
        [HttpGet("mapsto")]
        public dynamic GetMapSto()
        {
            var req = AMWUtil.Common.ObjectUtil.QryStrToDynamic(this.Request.QueryString.Value);
            var res = new GetMapStoAPI(this).Execute(req);
            return res;
        }
    }
}