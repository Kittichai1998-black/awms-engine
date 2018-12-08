using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.Controllers
{
    [Route("api2")]
    [ApiController]
    public class Api2Controller : ControllerBase
    {
        [HttpPost("mst/material")]
        public dynamic PutMaterial([FromBody]dynamic request)
        {
            APIService.Api2.PutMaterialAPI exec = new APIService.Api2.PutMaterialAPI(this);
            return exec.Execute(request);
        }

        [HttpPost("wm/receive/doc")]
        public dynamic CreateReceiveDoc([FromBody]dynamic request)
        {
            APIService.Api2.CreateReceiveAPI exec = new APIService.Api2.CreateReceiveAPI(this);
            return exec.Execute(request);
        }
    }
}