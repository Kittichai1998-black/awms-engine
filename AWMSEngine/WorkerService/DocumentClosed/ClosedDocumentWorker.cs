using AMWUtil.Exception;
using AWMSEngine.ADO.WMSDB;
using AWMSEngine.Engine.V2.Business.Document;
using AWMSEngine.HubService;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using iTextSharp.text;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.WorkerService.DocumentClosed
{
    public class ClosedDocumentWorker : BaseWorkerService
    {
        public ClosedDocumentWorker(long workerServiceID, IHubContext<CommonMessageHub> commonHub) : base(workerServiceID, commonHub)
        {
        }

        protected override void ExecuteEngine(Dictionary<string, string> options, VOCriteria buVO)
        {
            var docs = DataADO.GetInstant().SelectBy<amt_Document>(new SQLConditionCriteria[]
            {
                new SQLConditionCriteria("EventStatus", DocumentEventStatus.WORKED, SQLOperatorType.EQUALS),
                new SQLConditionCriteria("DocumentType_ID", string.Join(",", options["DocumentTypeID"]), SQLOperatorType.IN)
            }, buVO);

            try
            {
                if(docs.Count > 0)
                {
                    var docIDs = docs.Select(doc => doc.ID.Value).ToList();

                    var docClosing = new ClosingDocument().Execute(buVO.Logger, buVO, docIDs);
                    if(docClosing.Count > 0)
                        new ClosedDocument().Execute(buVO.Logger, buVO, docClosing);
                }                
            }
            catch (AMWException e)
            {
                throw new AMWException(buVO.Logger, AMWExceptionCode.V1002, e.Message);
            }
        }
    }
}
