using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AWMSEngine.APIService.Doc;
using AWMSEngine.APIService.Report;
using AWMSEngine.APIService.WM;
using AWMSModel.Constant.EnumConst;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.Controllers.WM
{
    [Route("api/wm/audit")]
    [ApiController]
    public class AuditController : ControllerBase
    {
        //[HttpGet("reconcile/fileserver")]
        //public dynamic GetDoc()
        //{
        //    PankanReconcileFileServerAPI exec = new PankanReconcileFileServerAPI(this);
        //    var req = ObjectUtil.QueryStringToObject(this.Request.QueryString.Value);
        //    var res = exec.Execute(req);
        //    return res;
        //}

        [HttpGet("doc")]
        public dynamic GetDoc()
        {
            GetDocAPI exec = new GetDocAPI(this);
            var req = ObjectUtil.QueryStringToObject(this.Request.QueryString.Value + "&docTypeID=" + (int)DocumentTypeID.AUDIT);
            var res = exec.Execute(req);
            return res;
        }

        [HttpPost("create")]
        public dynamic CreateQueue([FromBody]dynamic req)
        {
            CreateWorkQueueAuditAPI exec = new CreateWorkQueueAuditAPI(this);
            var res = exec.Execute(req);
            return res;
        }

        [HttpPost]
        public dynamic UpdateAudit([FromBody]dynamic req)
        {
            UpdateAuditAPI exec = new UpdateAuditAPI(this);
            var res = exec.Execute(req);
            return res;
        }
        [HttpGet]
        public dynamic Get()
        {
            SelectAuditAPI exec = new SelectAuditAPI(this);
            var req = ObjectUtil.QueryStringToObject(this.Request.QueryString.Value);
            var res = exec.Execute(req);
            return res;
        }
        [HttpPost("doc/Closing")]
        public dynamic ActionDocClosing([FromBody] dynamic req)
        {
            ClosePIDocAPI exec = new ClosePIDocAPI(this);
            var res = exec.Execute(req);
            return res;
        }
    }
}