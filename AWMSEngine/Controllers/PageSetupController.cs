﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
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
        [HttpGet("menu/{token}")]
        public dynamic Get(string token)
        {
            var jsond = ObjectUtil.QueryStringToObject(token);
            var api = new AWMSEngine.Engine.APIService.UI.ListMenuAPI();
            var res = api.Execute(jsond);
            return res;
        }
    }
}
