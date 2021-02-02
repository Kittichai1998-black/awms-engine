using AMWUtil.Exception;
using ADO.WMSDB;
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
using AMWUtil.Logger;
using AWMSModel.Constant.StringConst;

namespace AWMSEngine.WorkerService.DocumentClosed
{
    public class ClosedDocumentWorker : BaseWorkerService
    {
        public ClosedDocumentWorker(long workerServiceID, AMWLogger logger, IHubContext<CommonMessageHub> commonHub)
            : base(workerServiceID, logger, commonHub)
        {
        }

        protected override void ExecuteEngine(Dictionary<string, string> options, VOCriteria buVO)
        {
            FinalDatabaseLogCriteria FinalDBLog = (FinalDatabaseLogCriteria)buVO.GetDynamic(BusinessVOConst.KEY_FINAL_DB_LOG);

            var docs = DataADO.GetInstant().SelectBy<amt_Document>(new SQLConditionCriteria[]
            {
                new SQLConditionCriteria("EventStatus", DocumentEventStatus.WORKED, SQLOperatorType.EQUALS),
                new SQLConditionCriteria("DocumentType_ID", string.Join(",", options["DocumentTypeID"]), SQLOperatorType.IN)
            }, buVO);

            try
            {
                if(docs.Count > 0)
                {
                    buVO.Set(AWMSModel.Constant.StringConst.BusinessVOConst.KEY_DB_CONNECTION, DataADO.GetInstant().CreateConnection());
                    buVO.SqlTransaction_Begin();
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

            finally
            {

                FinalDBLog.sendAPIEvents.ForEach(x =>
                {
                    LogingADO.GetInstant().PutAPIPostBackEvent(x, buVO);
                });
                FinalDBLog.documentOptionMessages.ForEach(x =>
                {
                    LogingADO.GetInstant().PutDocumentAlertMessage(x, buVO);
                });
                buVO.SqlTransaction_Commit();

            }
        }
    }
}
