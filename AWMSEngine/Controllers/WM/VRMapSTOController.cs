using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWMSEngine.Engine.APIService.WM;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.Controllers.WM
{
    [Route("api/wm/VRMapSTO")]
    [ApiController]
    public class VRMapSTOController : ControllerBase
    {
        [HttpPost]
        public dynamic VRMapping(dynamic datas)
        {
            VRMapSTOAPI exec = new VRMapSTOAPI(this);
            return exec.Execute(datas);
        }

        [HttpPost("confirm")]
        public dynamic VRConfrim(dynamic datas)
        {
            VRMapSTOReceiveConfirmAPI exec = new VRMapSTOReceiveConfirmAPI(this);
            return exec.Execute(datas);
        }
    }
}