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
        [HttpGet("emptyLocation")]
        public dynamic CheckEmptyLocation()
        {
            return null;
        }

        [HttpPost("startQueueReceiving")]
        public dynamic StartQueueReceiving([FromBody] dynamic value)
        {
            return null;
        }

        [HttpPost("DoneQueue")]
        public dynamic DoneQueue([FromBody] dynamic value)
        {
            return null;
        }

        [HttpPost("UpldateQueueLocation")]
        public dynamic UpldateQueueLocation([FromBody] dynamic value)
        {
            return null;
        }
    }
}