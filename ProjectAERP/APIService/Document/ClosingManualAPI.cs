using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AWMSEngine.Engine.V2.Business.Document;
using AWMSModel.Constant.EnumConst;
using Microsoft.AspNetCore.Mvc;
using ProjectAERP.Engine.Document;

namespace ProjectAERP.APIService.Document
{
    public class ClosingManualAPI : AWMSEngine.APIService.BaseAPIService
    {
        public ClosingManualAPI(AWMSEngine.Controllers.V2.BaseController controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }
        public class TReq
        {
            public List<long> docIDs;
        }
        protected override dynamic ExecuteEngineManual()
        {
            List<long> docLists = new List<long>();

            TReq reqDoc = AMWUtil.Common.ObjectUtil.DynamicToModel<TReq>(this.RequestVO);
            reqDoc.docIDs.ForEach(doc =>
            {
                var docs = AWMSEngine.ADO.DocumentADO.GetInstant().Get(doc, this.BuVO);
                if (docs != null)
                {
                    if (docs.EventStatus == DocumentEventStatus.CLOSING)
                    {
                        this.BeginTransaction();
                        var resClosed = new ClosingDocument().Execute(this.Logger, this.BuVO, new List<long> { doc });
                        docLists.AddRange(resClosed);
                        this.CommitTransaction();
                    }

                }

            });

            return docLists;

        }
    }

}