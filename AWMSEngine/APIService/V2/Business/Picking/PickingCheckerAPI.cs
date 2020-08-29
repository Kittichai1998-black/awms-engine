using AWMSEngine.Engine.V2.Business.Document;
using AWMSEngine.Engine.V2.Business.Picking;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService.V2.Business.Picking
{
    public class PickingCheckerAPI : BaseAPIService
    {
        public PickingCheckerAPI(AWMSEngine.Controllers.V2.BaseController controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {

        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            PickingChecker.TReq reqDoneQ = AMWUtil.Common.ObjectUtil.DynamicToModel<PickingChecker.TReq>(this.RequestVO);
            var res = new PickingChecker().Execute(this.Logger, this.BuVO, reqDoneQ);

            var resWorked = new WorkedDocument().Execute(this.Logger, this.BuVO,
                new WorkedDocument.TReq() { docIDs = res.docIDs });
            this.CommitTransaction();
            return res;

        }
    }
}
