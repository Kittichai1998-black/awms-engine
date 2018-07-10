using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWMSEngine.Engine.APIService.WM;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.Controllers.WM
{
    [Route("api/wm/vrmapsto")]
    [ApiController]
    public class VirtualMapSTOController : ControllerBase
    {
        [HttpPost]
        public dynamic VirtualMapSTO(dynamic datas)
        {
            VirtualMapSTOAPI exec = new VirtualMapSTOAPI();
            return exec.Execute(datas);
        }

        [HttpPut]
        public dynamic UpdateSTO(dynamic datas)
        {
            GetMappingStorageObjectAPI exec = new GetMappingStorageObjectAPI();
            return exec.Execute(datas);
        }
    }
}