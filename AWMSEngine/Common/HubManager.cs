using AWMSEngine.HubService;
using AWMSEngine.WorkerService;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace AWMSEngine.Common
{
    public class HubManager : BackgroundService
    {
        private static IHubContext<CommonMessageHub> _CommonMessageHub { get; set; }
        public static IHubContext<CommonMessageHub> CommonMessageHub
        {
            get => _CommonMessageHub;
        }

        public HubManager(ILogger<CommonDashboardWorker> logger, IHubContext<CommonMessageHub> commonHub)
        {
            _CommonMessageHub = commonHub;
        }

        protected override Task ExecuteAsync(CancellationToken stoppingToken)
        {
            return null;
        }
    }
}
