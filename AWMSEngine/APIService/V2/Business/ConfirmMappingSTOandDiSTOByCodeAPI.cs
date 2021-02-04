using AMWUtil.Common;
using AWMSEngine.Engine.V2.Business;
using AWMSEngine.Engine.V2.Business.Document;
using AWMSEngine.Engine.V2.Business.Received;
using AMSModel.Constant.EnumConst;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService.V2.Business
{
    public class ConfirmMappingSTOandDiSTOBybstoIDAPI : BaseAPIService
    {
        public ConfirmMappingSTOandDiSTOBybstoIDAPI(AWMSEngine.Controllers.V2.BaseController controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }
        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = ObjectUtil.DynamicToModel<ConfirmSTOReceivebybstoID.TReq>(this.RequestVO);
            var res = new ConfirmSTOReceivebybstoID().Execute(this.Logger, this.BuVO, req);
            var resWorked = new WorkedDocument().Execute(this.Logger, this.BuVO, new WorkedDocument.TReq() { docIDs = new List<long>() { res.docID } });
            this.CommitTransaction();

            return res;
        }
    }
}