using AWMSEngine.Engine.V2.Business.Counting;
using AWMSEngine.Engine.V2.Business.Document;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService.V2.Business.Couting
{
    public class CoutingCheckerAPI : BaseAPIService
    {
        public CoutingCheckerAPI(AWMSEngine.Controllers.V2.BaseController controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {

        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            CoutingChecker.TReq reqDoneQ = AMWUtil.Common.ObjectUtil.DynamicToModel<CoutingChecker.TReq>(this.RequestVO);
            var res = new CoutingChecker().Execute(this.Logger, this.BuVO, reqDoneQ);

            var resWorked = new WorkedDocument().Execute(this.Logger, this.BuVO,
                new WorkedDocument.TReq() { docIDs = res.docIDs });
            this.CommitTransaction();

            this.BeginTransaction();
            var resClosing = new WorkedDocument().Execute(this.Logger, this.BuVO,
               new WorkedDocument.TReq() { docIDs = resWorked });
            this.CommitTransaction();

            this.BeginTransaction();
            var resClosed = new WorkedDocument().Execute(this.Logger, this.BuVO,
               new WorkedDocument.TReq() { docIDs = resClosing });
            this.CommitTransaction();
            return res;

        }
    }
}
