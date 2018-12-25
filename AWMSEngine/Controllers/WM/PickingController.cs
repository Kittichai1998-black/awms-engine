using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWMSEngine.APIService.WM;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.Controllers.WM
{
    [Route("api/picking")]
    [ApiController]
    public class PickingController : ControllerBase
    {
        //[HttpGet("location")]
        public dynamic GetPalletPicking()
        {
            var value = AMWUtil.Common.ObjectUtil.QueryStringToObject(this.Request.QueryString.Value);
            var res = new APIService.WM.SelectPickingAPI(this).Execute(value);
            return res;
        }

        [HttpPost]
        public dynamic PostUpdatePicking([FromBody]dynamic req)
        {
            UpdateIssuedPickingAPI exec = new UpdateIssuedPickingAPI(this);
            var res = exec.Execute(req);
            return res;
        }
    }
}