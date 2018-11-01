using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AWMSEngine.APIService.Doc;
using AWMSModel.Constant.EnumConst;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.Controllers.WM
{
    [Route("api/wm/received")]
    [ApiController]
    public class ReceivedController : ControllerBase
    {
        [HttpGet("doc")]
        public dynamic Get()
        {
            GetDocAPI exec = new GetDocAPI(this);
            var req = ObjectUtil.QueryStringToObject(this.Request.QueryString.Value + "&docTypeID=" + (int)DocumentTypeID.GOODS_RECEIVED);
            var res = exec.Execute(req);
            return res;
        }
        [HttpPost("doc")]
        public dynamic Create([FromBody]dynamic data)
        {
            CreateGRDocAPI exec = new CreateGRDocAPI(this);
            var res = exec.Execute(data);
            return res;
        }
        [HttpPost("doc/transfer")]
        public dynamic Transfer([FromBody]dynamic data)
        {
            CreateGRDocAPI exec = new CreateGRDocAPI(this);
            var res = exec.Execute(data);
            return res;
        }
    }
}