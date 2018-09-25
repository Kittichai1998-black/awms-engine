﻿using System;
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
    [Route("api/wm/issued")]
    [ApiController]
    public class IssuedController : ControllerBase
    {
        [HttpGet("doc")]
        public dynamic GetDoc()
        {
            GetDocAPI exec = new GetDocAPI(this);
            var req = ObjectUtil.QueryStringToObject(this.Request.QueryString.Value + "&docTypeID=" + (int)DocumentTypeID.GOODS_ISSUED);
            var res = exec.Execute(req);
            return res;
        }
        [HttpGet("sto/indoc")]
        public dynamic GetDocSTO()
        {
            GetMapSTOInDocAPI exec = new GetMapSTOInDocAPI(this);
            var req = ObjectUtil.QueryStringToObject(this.Request.QueryString.Value + "&docTypeID=" + (int)DocumentTypeID.GOODS_ISSUED);
            var res = exec.Execute(req);
            return res;
        }
        [HttpPost("doc")]
        public dynamic CreateDoc([FromBody] dynamic req)
        {
            CreateGIDocAPI exec = new CreateGIDocAPI(this);
            var res = exec.Execute(req);
            return res;
        }
        [HttpPost("doc/rejected")]
        public dynamic ActionDocReject([FromBody] dynamic req)
        {
            RejectedGIDocAPI exec = new RejectedGIDocAPI(this);
            var res = exec.Execute(req);
            return res;
        }
        [HttpPost("doc/working")]
        public dynamic ActionDocWorking([FromBody] dynamic req)
        {
            WorkingGIDocAPI exec = new WorkingGIDocAPI(this);
            var res = exec.Execute(req);
            return res;
        }
        [HttpGet("bsto/canConso")]
        public dynamic GetBSTOCanConso()
        {
            var req = ObjectUtil.QueryStringToObject(this.Request.QueryString.Value);
            CheckBSTOCanConsoAPI exec = new CheckBSTOCanConsoAPI(this);
            var res = exec.Execute(req);
            return res;
        }
        [HttpGet("location/canPick")]
        public dynamic GetLocationCanPick()
        {
            var req = ObjectUtil.QueryStringToObject(this.Request.QueryString.Value);
            ListAreaLocationCanPickingAPI exec = new ListAreaLocationCanPickingAPI(this);
            var res = exec.Execute(req);
            return res;
        }
        [HttpPost("sto/pickConso")]
        public dynamic StoPick([FromBody] dynamic req)
        {
            ScanPickingAndConsoAPI exec = new ScanPickingAndConsoAPI(this);
            var res = exec.Execute(req);
            return res;
        }




    }
}