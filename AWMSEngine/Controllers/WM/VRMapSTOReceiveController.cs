using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.Controllers.WM
{
    [Route("api/wm/VRMapSTOReceive")]
    [ApiController]
    public class VRMapSTOReceiveController : ControllerBase
    {
        [HttpPost]
        public dynamic Confrim(decimal data)
        {
            var res = new Engine.APIService.WM.VRMapSTOReceiveConfirmAPI().Execute(data);
            return res;
        }
    }
}