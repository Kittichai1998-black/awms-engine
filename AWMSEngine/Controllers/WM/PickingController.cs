using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.Controllers.WM
{
    [Route("api/picking")]
    [ApiController]
    public class PickingController : ControllerBase
    {
        //[HttpGet("location")]
        public dynamic GetLocationInfo()
        {
            var value = AMWUtil.Common.ObjectUtil.QueryStringToObject(this.Request.QueryString.Value);
            var res = new APIService.WM.SelectPickingAPI(this).Execute(value);
            return res;
        }
    }
}