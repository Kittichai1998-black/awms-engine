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
    [Route("api/wm/stkcorr")]
    [ApiController]
    public class StockCorrectionController : ControllerBase
    {
        [HttpGet("doc")]
        public dynamic GetDoc()
        {
            GetDocAPI exec = new GetDocAPI(this);
            var req = ObjectUtil.QryStrToDynamic(this.Request.QueryString.Value + "&docTypeID=" + (int)DocumentTypeID.STOCK_CORRECTIONS);
            var res = exec.Execute(req);
            return res;
        }
        [HttpPost("doc/closed")]
        public dynamic CreateClosedDoc([FromBody]dynamic req)
        {
            CreateWorkedSTCDocAPI exec = new CreateWorkedSTCDocAPI(this);
            var res = exec.Execute(req);
            return res;
        }
    }
}