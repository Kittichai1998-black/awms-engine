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
    [Route("api/log")]
    [ApiController]
    public class DataLogController : ControllerBase
    {

        [HttpGet]
        public dynamic GetData()
        {
            var jsond = ObjectUtil.QryStrToDynamic(this.Request.QueryString.Value);
            var api = new SelectDataLogAPI(this);
            var res = api.Execute(jsond);
            return res;
        }

    }
}