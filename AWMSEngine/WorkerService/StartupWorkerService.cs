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
    public class StartupWorkerService : BackgroundService
    {
        private IHubContext<CommonMessageHub> _CommonHub { get; set; }
        public StartupWorkerService(ILogger<CommonDashboardWorker> logger, IHubContext<CommonMessageHub> commonHub)
        {
            this._CommonHub = commonHub;
        }

        protected override Task ExecuteAsync(CancellationToken stoppingToken)
        {
            var workers = ADO.WMSStaticValue.StaticValueManager.GetInstant().WorkerService;
            foreach (var wk in workers)
            {
                Task.Run(() =>
                {
                    string workerClassName = wk.FullClassName;
                    var t = AMWUtil.Common.ClassType.GetClassType(workerClassName);
                    var exec = (BaseWorkerService)Activator.CreateInstance(t, new object[] { wk.ID.Value, this._CommonHub });
                    return exec.ExecuteAsync();
                });
            }
            return Task.CompletedTask;
        }
    }
}
