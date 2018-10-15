using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AWMSEngine.APIService.Doc;
using AWMSEngine.APIService.WM;
using AWMSEngine.Engine.Business.Loading;
using AWMSModel.Constant.EnumConst;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.Controllers.WM
{
    [Route("api/wm/loading")]
    [ApiController]
    public class LoadingController : ControllerBase
    {
        [HttpGet("doc")]
        public dynamic GetDocument()
        {
            GetDocAPI exec = new GetDocAPI(this);
            var req = ObjectUtil.QueryStringToObject(this.Request.QueryString.Value + "&docTypeID=" + (int)DocumentTypeID.LOADING);
            var res = exec.Execute(req);
            return res;
        }
        [HttpPost("doc")]
        public dynamic CreateDocument([FromBody]dynamic req)
        {
            AWMSEngine.APIService.Doc.CreateLDDocAPI exec = new CreateLDDocAPI(this);
            var res = exec.Execute(req);
            return res;
        }
        [HttpPost("doc/working")]
        public dynamic WorkingDocument([FromBody]dynamic req)
        {
            WorkingGIDocAPI exec = new WorkingGIDocAPI(this);
            var res = exec.Execute(req);
            return res;
        }
        [HttpPost("doc/reject")]
        public dynamic RejectDocument([FromBody]dynamic req)
        {
            RejectedGIDocAPI exec = new RejectedGIDocAPI(this);
            var res = exec.Execute(req);
            return res;
        }
        [HttpPost("conso")]
        public dynamic PostConsolidate([FromBody]dynamic req)
        {
            ScanConsoToLoadingAPI exec = new ScanConsoToLoadingAPI(this);
            return exec.Execute(req);
        }
        [HttpGet("conso")]
        public dynamic ListBaseConsoCanLoading()
        {
            dynamic req = ObjectUtil.QueryStringToObject(this.Request.QueryString.Value);
            ListBaseConsoCanLoadingAPI exec = new ListBaseConsoCanLoadingAPI(this);
            return exec.Execute(req);
        }
    }
}