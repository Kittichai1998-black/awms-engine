using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AWMSEngine.APIService.Permission;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.Controllers
{
    [Produces("application/json")]
    [Route("api/[controller]")]
    [ApiController]
    public class PageSetupController : ControllerBase
    {
        // GET: api/PageSetup
        [HttpGet("menu")]
        public dynamic Get()
        {
            var jsond = ObjectUtil.QueryStringToObject(this.Request.QueryString.Value);
            var api = new ListMenuAPI(this);
            var res = api.Execute(jsond);
            return res;
        }
    }
}
