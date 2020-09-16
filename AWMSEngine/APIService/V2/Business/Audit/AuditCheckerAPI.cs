using AWMSEngine.Engine.V2.Business.Document;
using AWMSEngine.Engine.V2.Business.Auditor;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService.V2.Business.Audit
{
    public class AuditCheckerAPI : BaseAPIService
    {
        public AuditCheckerAPI(AWMSEngine.Controllers.V2.BaseController controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {

        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            AuditChecker.TReq reqDoneQ = AMWUtil.Common.ObjectUtil.DynamicToModel<AuditChecker.TReq>(this.RequestVO);
            var res = new AuditChecker().Execute(this.Logger, this.BuVO, reqDoneQ);

            var resWorked = new WorkedDocument().Execute(this.Logger, this.BuVO,
                new WorkedDocument.TReq() { docIDs = res.docIDs });
            this.CommitTransaction();

            this.BeginTransaction();
            var resClosing = new ClosingDocument().Execute(this.Logger, this.BuVO, resWorked);
            this.CommitTransaction();

            this.BeginTransaction();
            var resClosed = new ClosedDocument().Execute(this.Logger, this.BuVO, resClosing);
            this.CommitTransaction();
            return res;

        }
    }
}
