using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace WCSSimAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WCSOutboundsController : ControllerBase
    {
        [HttpPost]
        public void RegisterOutbounds([FromBody] dynamic data)
        {

        }
    }
}