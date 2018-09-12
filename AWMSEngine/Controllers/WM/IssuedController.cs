using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AWMSEngine.APIService.Doc;
using AWMSEngine.APIService.WM;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.Controllers.WM
{
    [Route("api/wm/issued")]
    [ApiController]
    public class IssuedController : ControllerBase
    {
        [HttpPost("doc")]
        public dynamic CreateDoc([FromBody] dynamic req)
        {
            GIDocCreateAPI exec = new GIDocCreateAPI(this);
            var res = exec.Execute(req);
            return res;
        }
        [HttpPost("doc/rejected")]
        public dynamic ActionDocReject([FromBody] dynamic req)
        {
            GIDocRejectAPI exec = new GIDocRejectAPI(this);
            var res = exec.Execute(req);
            return res;
        }
        [HttpPost("doc/working")]
        public dynamic ActionDocWorking([FromBody] dynamic req)
        {
            GIDocWorkingAPI exec = new GIDocWorkingAPI(this);
            var res = exec.Execute(req);
            return res;
        }
        [HttpGet("bsto/forconso")]
        public dynamic GetBSTOForConso()
        {
            var req = ObjectUtil.QueryStringToObject(this.Request.QueryString.Value);
            BSTOMatchGIDocCheckAPI exec = new BSTOMatchGIDocCheckAPI(this);
            var res = exec.Execute(req);
            return res;
        }
        [HttpGet("location/forpick")]
        public dynamic GetLocationForPick([FromBody] dynamic req)
        {
            return null;
        }
        [HttpPost("sto/pick")]
        public dynamic StoPick([FromBody] dynamic req)
        {
            return null;
        }




    }
}