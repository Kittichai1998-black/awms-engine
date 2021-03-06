 using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using AMWUtil.Common;
using AWMSEngine.APIService.V2.Permission;
using AWMSEngine.HubService;
using DinkToPdf.Contracts;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Newtonsoft.Json;

namespace AWMSEngine.Controllers.V2
{
    [Route("v2/token")]
    [ApiController]
    public class TokenController : BaseController
    {
        public TokenController(IHubContext<CommonMessageHub> commonMsgHub, IWebHostEnvironment hostingEnvironment, IConverter converter) : base(commonMsgHub, hostingEnvironment, converter)
        {
        }

        [HttpPost("register")]  
        public dynamic RegisterToken([FromBody] dynamic request)
        {
            var api = new RegisterTokenAPI(this);
            var res = api.Execute(request);
            return res;
        }

        [HttpDelete("remove")]
        public dynamic RemoveToken([FromBody] dynamic request)
        {
            var api = new RemoveTokenAPI(this);
            var res = api.Execute(request);
            return res;
        }

        [HttpGet("enquiry")]
        public dynamic EnquiryToken()
        {
            var qrystr = this.Request.QueryString.Value.Replace("?", "");
            var jsond = ObjectUtil.QryStrToDynamic(qrystr);
            var api = new EnquiryTokenAPI(this);
            var res = api.Execute(jsond);

            return res;
        }

        [HttpPut("extend")]
        public dynamic ExtendToken([FromBody] dynamic request)
        {
            var api = new ExtendTokenAPI(this);
            var res = api.Execute(request);

            return res;
        }
    }
}