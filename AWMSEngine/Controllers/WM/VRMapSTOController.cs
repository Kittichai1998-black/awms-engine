﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWMSEngine.APIService.WM;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.Controllers.WM
{
    [Route("api/wm/VRMapSTO")]
    [ApiController]
    public class VRMapSTOController : ControllerBase
    {
        [HttpPost]
        public dynamic VRMapping(dynamic datas)
        {
            ScanMapStoAPI exec = new ScanMapStoAPI(this);
            return exec.Execute(datas);
        }

        [HttpPost("confirm")]
        public dynamic VRConfrim(dynamic datas)
        {
            ConfirmMapSTOReceiveAPI exec = new ConfirmMapSTOReceiveAPI(this);
            return exec.Execute(datas);
        }

        [HttpGet("price")]
        public dynamic GetPrice()
        {
            var req = AMWUtil.Common.ObjectUtil.QueryStringToObject(this.Request.QueryString.Value);
            ListPriceByRootID exec = new ListPriceByRootID(this);
            return exec.Execute(req);// exec.Execute(datas);
        }

    }
}