using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWMSEngine.APIService.WM;
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
            ScanMapSTOAPI exec = new ScanMapSTOAPI(this);
            return exec.Execute(datas);
        }

        [HttpPost("confirm")]
        public dynamic VRConfrim(dynamic datas)
        {
            ConfirmMapSTOReceiveAPI exec = new ConfirmMapSTOReceiveAPI(this);
            return exec.Execute(datas);
        }
    }
}