using ADO.WMSDB;
using AMSModel.Constant.EnumConst;
using AMSModel.Criteria;
using AMSModel.Entity;
using AMWUtil.Common;
using AMWUtil.Logger;
using AWMSEngine.HubService;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectGCL.WorkerService
{
    public class PA_ClosingToClosed_Worker : AWMSEngine.WorkerService.BaseWorkerService
    {
        public PA_ClosingToClosed_Worker(long workerServiceID, AMWLogger logger, IHubContext<CommonMessageHub> commonHub) : base(workerServiceID, logger, commonHub)
        {
        }

        protected override void ExecuteEngine(Dictionary<string, string> options, VOCriteria buVO)
        {
            var docs = 
                ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_Document>(
                new SQLConditionCriteria[]
                {
                    new SQLConditionCriteria("status",EntityStatus.ACTIVE, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("eventStatus",DocumentEventStatus.CLOSING, SQLOperatorType.EQUALS)
                }, buVO);
            docs.ForEach(doc =>
            {
                var docis = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_DocumentItem>(
                    ListKeyValue<string, object>.New("Document_ID", doc.ID.Value).Add("status",EntityStatus.ACTIVE),
                    buVO);
                if(docis.TrueForAll(di => di.EventStatus == DocumentEventStatus.WORKED))
                {
                    this.ClosedDocument(doc, buVO);
                }
            });
        }

        private void ClosedDocument(amt_Document doc,VOCriteria buVO)
        {
            DataADO.GetInstant().UpdateBy<amt_Document >(
                ListKeyValue<string, object>.New("ID", doc.ID).Add("status", EntityStatus.ACTIVE),
                ListKeyValue<string, object>.New("eventstatus", DocumentEventStatus.CLOSED).Add("status", EntityStatus.DONE),
                buVO);
            DataADO.GetInstant().UpdateBy<amt_DocumentItem>(
                ListKeyValue<string, object>.New("Document_ID", doc.ID).Add("status", EntityStatus.ACTIVE),
                ListKeyValue<string, object>.New("eventstatus", DocumentEventStatus.CLOSED).Add("status", EntityStatus.DONE),
                buVO);

        }
    }
}
