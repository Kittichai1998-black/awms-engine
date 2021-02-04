using ADO.WMSDB;
using AMWUtil.Common;
using AWMSEngine.Engine.V2.Business.Document;
using AMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService.V2.Document
{
    public class CloseGRAPI : BaseAPIService
    {
    
        public CloseGRAPI(AWMSEngine.Controllers.V2.BaseController controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }
        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = ObjectUtil.DynamicToModel<UpdateOptionsDocumentByCodeAPI.TReq>(this.RequestVO);
            var res = new CloseGR().Execute(this.Logger, this.BuVO, req);
            var resWorked = new WorkedDocument().Execute(this.Logger, this.BuVO, new WorkedDocument.TReq() { docIDs = new List<long> { res.docID } });
            this.CommitTransaction();

            return resWorked;
        }
    }
}
