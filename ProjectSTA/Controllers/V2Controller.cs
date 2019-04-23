using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ProjectSTA.Controllers
{
    [Route("v2")]
    [ApiController]
    public class V2Controller : AWMSEngine.Controllers.APIv2Controller
    {
    }
}