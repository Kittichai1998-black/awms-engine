using AMWUtil.Common;
using AWMSEngine.HubService;
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
    public class DashboardWorker : BackgroundService
    {
        private readonly ILogger<DashboardWorker> logger;
        private readonly IHubContext<CommonMessageHub> commonMsgHub;

        public DashboardWorker(ILogger<DashboardWorker> logger, IHubContext<CommonMessageHub> clockHub)
        {
            this.logger = logger;
            this.commonMsgHub = clockHub;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {

                Dapper.DynamicParameters parameter = new Dapper.DynamicParameters();
                parameter.Add("areaIDs", "1,2,3,4,5,6,7,8,9,10,11");
                var res = ADO.DataADO.GetInstant().QuerySP("RP_DASHBOARD_RETURN_STO_ON_FLOOR", parameter, null);


                logger.LogInformation($"Worker running at: {DateTime.Now}");
                await commonMsgHub.Clients.All.SendAsync("ReceiveMessage", res.Json());
                await Task.Delay(5000);
            }
        }
    }
}
