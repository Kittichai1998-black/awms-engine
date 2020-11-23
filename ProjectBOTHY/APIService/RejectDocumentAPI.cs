using AMWUtil.Common;
using AWMSEngine.APIService;
using AWMSEngine.Controllers.V2;
using ProjectBOTHY.Engine.Document;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectBOTHY.APIService
{
    public class RejectDocumentAPI : BaseAPIService
    {
        public RejectDocumentAPI(AWMSEngine.Controllers.V2.BaseController controllerAPI,int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req= ObjectUtil.DynamicToModel<RejectDocument.TReq>(this.RequestVO);
            var res = new RejectDocument().Execute(this.Logger,this.BuVO,req);
            return res;
        }
    }
}
