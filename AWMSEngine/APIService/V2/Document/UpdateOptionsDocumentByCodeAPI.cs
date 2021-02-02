using AWMSEngine.Engine.V2.Business.Document;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService.V2.Document
{
    public class UpdateOptionsDocumentByCodeAPI : BaseAPIService
    {
        public UpdateOptionsDocumentByCodeAPI(AWMSEngine.Controllers.V2.BaseController controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }
        public class TReq {
            public string code = "GR2101000008";
            public string pallet;
            public string lastPallet;
        }
        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            UpdateOptionsDocumentByCodeAPI.TReq req = AMWUtil.Common.ObjectUtil.DynamicToModel<UpdateOptionsDocumentByCodeAPI.TReq>(this.RequestVO);
            var res = new UpdateOptionsDocumentByCode().Execute(this.Logger, this.BuVO, req);
            this.CommitTransaction();

            return res;
        }
    }


}
