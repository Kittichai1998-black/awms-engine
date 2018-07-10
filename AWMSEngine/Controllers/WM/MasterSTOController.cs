using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWMSEngine.Engine.APIService.WM;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.Controllers.WM
{
    [Route("api/wm/mststo")]
    [ApiController]
    public class MasterSTOController : ControllerBase
    {
        [HttpGet]
        public dynamic GetMstSTO(string code)
        {
            var res = new GetMstSTOAPI().Execute(new { code = code });
            return res;
        }
    }
}