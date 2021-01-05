using AMWUtil.Common;
using AMWUtil.Logger;
using AWMSEngine.HubService;
using AWMSModel.Criteria;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.WorkerService.MonitorWorker
{
    public class MonitorWorker : BaseWorkerService

    {
        public class TRes
        {
            public List<GateDetail> gateDetails;
            public class GateDetail
            {
                public string gateCode;
                public string skuCode;
                public string lot;
                public decimal qty;
                public decimal allQty;
            }
        }
        public MonitorWorker(long workerServiceID, AMWLogger logger, IHubContext<CommonMessageHub> commonHub)
           : base(workerServiceID, logger, commonHub)
        {
        }
        protected override void ExecuteEngine(Dictionary<string, string> options, VOCriteria buVO)
        {
            var res = new List<TRes.GateDetail>();
            for (var i = 1; i < 10; i++) {
                res.Add(new TRes.GateDetail()
                {
                    allQty = 10,
                    gateCode = "G0" + i,
                    skuCode = i.ToString(),
                    lot = i.ToString(),
                    qty = i,
                }) ;

            }
            this.CommonMsgHub.Clients.All.SendAsync(options["_hubname"], res.Json());
        }
    }
}
