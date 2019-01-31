using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AWMSEngine.APIService.Doc;
using AWMSEngine.APIService.WM;
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
        [HttpPost("doc/rejected")]
        public dynamic ActionDocReject([FromBody] dynamic req)
        {
            RejectedGRDocAPI exec = new RejectedGRDocAPI(this);
            var res = exec.Execute(req);
            return res;
        }
        [HttpPost("doc/close")]
        public dynamic ActionDocColse([FromBody] dynamic req)
        {
            CloseGRDocAPI exec = new CloseGRDocAPI(this);
            var res = exec.Execute(req);
            return res;
        }
        [HttpGet("doc/SAPRes")]
        public dynamic SAPRes()
        {
            GetSAPLogAPI exec = new GetSAPLogAPI(this);
            var req = ObjectUtil.QueryStringToObject(this.Request.QueryString.Value);
            var res = exec.Execute(req);
            return res;
        }
    }
}