using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AWMSEngine.APIService.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.Controllers
{
    [Route("api/ers")]
    [ApiController]
    public class ErpSAPDataController : ControllerBase
    {
        [HttpGet]
        public dynamic GetData()
        {
            var jsond = ObjectUtil.QueryStringToObject(this.Request.QueryString.Value);
            var api = new SelectDataErpAPI(this);
            var res = api.Execute(jsond);
            return res;
        }
    }
}