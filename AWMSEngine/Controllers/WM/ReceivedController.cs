﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.Controllers.WM
{
    [Route("api/wm/received")]
    [ApiController]
    public class ReceivedController : ControllerBase
    {
        [HttpGet("doc")]
        public dynamic Get(dynamic data)
        {
            var req = ObjectUtil.QueryStringToObject(this.Request.QueryString.Value);
            //var res = 
            return null;
        }
        [HttpPost("doc")]
        public dynamic Post(dynamic data)
        {
            var req = ObjectUtil.QueryStringToObject(this.Request.QueryString.Value);
            return null;
        }
    }
}