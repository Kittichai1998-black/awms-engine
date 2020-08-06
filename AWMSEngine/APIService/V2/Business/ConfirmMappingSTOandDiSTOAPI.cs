using AMWUtil.Common;
using AWMSEngine.Engine.V2.Business;
using AWMSEngine.Engine.V2.Business.Document;
using AWMSEngine.Engine.V2.Business.Received;
using AWMSModel.Constant.EnumConst;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService.V2.Business
{
    public class ConfirmMappingSTOandDiSTOAPI : BaseAPIService
    {
        public ConfirmMappingSTOandDiSTOAPI(AWMSEngine.Controllers.V2.BaseController controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }
        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = ObjectUtil.DynamicToModel<ConfirmSTOReceivebyDocID.TReq>(this.RequestVO);
            var res = new ConfirmSTOReceivebyDocID().Execute(this.Logger, this.BuVO, req);
            this.CommitTransaction();
            var docs = AWMSEngine.ADO.DocumentADO.GetInstant().Get(res.docID, this.BuVO);
            if (docs != null)
            {
                if (docs.EventStatus == DocumentEventStatus.WORKING)
                {
                    this.BeginTransaction();
                    var resWorked = new WorkedDocument().Execute(this.Logger, this.BuVO, new WorkedDocument.TReq() { docIDs = new List<long>() { res.docID } });
                    this.CommitTransaction();
                    if (resWorked.Count > 0)
                    {
                        this.BeginTransaction();
                        var resClosing = new ClosingDocument().Execute(this.Logger, this.BuVO, resWorked);
                        this.CommitTransaction();
                    }
                }
                else if (docs.EventStatus == DocumentEventStatus.WORKED || docs.EventStatus == DocumentEventStatus.CLOSING)
                {
                    this.BeginTransaction();
                    var resClosing = new ClosingDocument().Execute(this.Logger, this.BuVO, new List<long>() { res.docID });
                    this.CommitTransaction();

                }

            }
            return res;
        }
    }
}