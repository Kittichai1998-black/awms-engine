using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWMSEngine.Engine.V2.Business.WorkQueue;
using AWMSModel.Constant.EnumConst;
using AWMSEngine.APIService;

namespace AWMSEngine.APIService.Business
{

    public class CloseDocAPI : BaseAPIService
    {
        public CloseDocAPI(ControllerBase controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        public class TReq
        {
            public List<long> docIDs;
        }

        protected override dynamic ExecuteEngineManual()
        {
            List<long> res = new List<long>();

            TReq reqDoc = AMWUtil.Common.ObjectUtil.DynamicToModel<TReq>(this.RequestVO);
            reqDoc.docIDs.ForEach(doc =>
            {
            var docs = AWMSEngine.ADO.DocumentADO.GetInstant().Get(doc, this.BuVO);
            if (docs != null)
            {
                if (docs.EventStatus == DocumentEventStatus.NEW)
                {
                    //เอา error ไปเก็บไว้ใน options
                    BuVO.FinalLogDocMessage.Add(new AWMSModel.Criteria.FinalDatabaseLogCriteria.DocumentOptionMessage(
                        docs.ID.Value, null, null, "Document Eventstatus is NEW"
                    ));
                }else{
                        //this.BeginTransaction();                       
                        TReq req = AMWUtil.Common.ObjectUtil.DynamicToModel<TReq>(this.RequestVO);
                        if (docs.EventStatus == DocumentEventStatus.CLOSING)
                        {
                            var resClosed = new ClosedDocument().Execute(this.Logger, this.BuVO, req.docIDs);
           
                        }
                        else
                        {
                            var resWorked = new WorkedDocument().Execute(this.Logger, this.BuVO, req.docIDs);

                            if (resWorked.Count > 0)
                            {
                                var resClosing = new ClosingDocument().Execute(this.Logger, this.BuVO, resWorked);
                                if (resClosing.Count > 0)
                                {
                                    var resClosed = new ClosedDocument().Execute(this.Logger, this.BuVO, resClosing);
                                }
                            }
                        }                      
                    }
                }
            });

            return null;
        }

    }
}
