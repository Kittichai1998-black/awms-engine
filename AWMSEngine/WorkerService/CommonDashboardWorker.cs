using AMWUtil.Common;
using AMWUtil.Logger;
using AWMSEngine.HubService;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace AWMSEngine.WorkerService
{
    public class CommonDashboardWorker : BaseWorkerService
    {
        public CommonDashboardWorker(long workerServiceID, AMWLogger logger, IHubContext<CommonMessageHub> commonHub) 
            : base(workerServiceID, logger, commonHub)
        {
        }

        protected override void ExecuteEngine(Dictionary<string, string> options, VOCriteria buVO)
        {
            Dapper.DynamicParameters parameter = new Dapper.DynamicParameters();
            options.ToList().ForEach(x =>
            {
                if (!x.Key.StartsWith("_"))
                    parameter.Add(x.Key, x.Value);
            });
            var res = ADO.WMSDB.DataADO.GetInstant().QuerySP(options["_spname"], parameter, null);
            this.CommonMsgHub.Clients.All.SendAsync(options["_hubname"], res.Json());
        }

    }
}
