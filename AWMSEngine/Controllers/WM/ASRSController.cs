using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.Controllers.WM
{
    [Route("api/wm/asrs")]
    [ApiController]
    public class ASRSController : ControllerBase
    {
        [HttpGet("location")]
        public dynamic GetLocationInfo()
        {
            var value = AMWUtil.Common.ObjectUtil.QueryStringToObject(this.Request.QueryString.Value);
            var res = new APIService.ASRS.GetLocationInfoAPI(this).Execute(value);
            return res;
        }

        [HttpPost("queue/register")]
        public dynamic RegisterInboundQueueAPI([FromBody] dynamic value)
        {
            var res = new APIService.ASRS.RegisterQueueAPI(this).Execute(value);
            return res;
        }

        [HttpPost("queue/done")]
        public dynamic DoneQueue([FromBody] dynamic value)
        {
            var res = new APIService.ASRS.DoneQueueAPI(this).Execute(value);
            return res;
        }

        [HttpPost("queue/working")]
        public dynamic UpldateQueue([FromBody] dynamic value)
        {
            var res = new APIService.ASRS.WorkingStageQueueAPI(this).Execute(value);
            return res;
        }
        [HttpPut("sto/location")]
        public dynamic UpldateLocation([FromBody] dynamic value)
        {
            var res = new APIService.ASRS.UpdateStoLocationAPI(this).Execute(value);
            return res;
        }

        [HttpPost("sto/mapping")]
        public dynamic Mapping([FromBody] dynamic value)
        {
            var res = new APIService.ASRS.WCSMappingPalletAPI(this).Execute(value);
            return res;
        }

        [HttpGet("queue/view")]
        public dynamic View()
        {
            var value = AMWUtil.Common.ObjectUtil.QueryStringToObject(this.Request.QueryString.Value);
            var res = new APIService.ASRS.ViewQueueAPI(this).Execute(value);
            return res;
        }
    }
}