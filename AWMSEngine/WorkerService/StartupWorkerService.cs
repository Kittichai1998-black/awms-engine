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
    public class StartupWorkerService : BackgroundService
    {
        public class TTask
        {
            public ams_WorkerService worker;
            public Task task;
        }
        public static List<TTask> Tasks { get; set; }
        private IHubContext<CommonMessageHub> _CommonHub { get; set; }
        public StartupWorkerService(ILogger<CommonDashboardWorker> logger, IHubContext<CommonMessageHub> commonHub)
        {
            this._CommonHub = commonHub;
        }

        protected override Task ExecuteAsync(CancellationToken stoppingToken)
        {
            var logger =  AMWLoggerManager.GetLogger("worker", "WORKER");
            logger.LogInfo("######### START WOKRER #########");
            StartupWorkerService.Tasks = new List<TTask>();
            var workers = ADO.WMSStaticValue.StaticValueManager.GetInstant().WorkerService;
            foreach (var wk in workers)
            {
                this.Run(wk, logger);
            }

            while (true)
            {
                var tasks = StartupWorkerService.Tasks.FindAll(x => x.task.IsCompleted || x.task.IsCanceled || x.task.IsFaulted);
                foreach (var t in tasks)
                {
                    logger.LogInfo("[" + t.worker.Code + "(" + t.worker.ID.Value + ")] " +
                        "==== task.IsCompleted:" + t.task.IsCompleted + " | " +
                        "task.IsCanceled:" + t.task.IsCanceled + " | " +
                        "task.IsFaulted:" + t.task.IsFaulted + " ====");
                    StartupWorkerService.Tasks.Remove(t);
                    this.Run(t.worker, logger);
                    logger.LogInfo("[" + t.worker.Code + "("+t.worker.ID.Value+")] ==== TRY BEGIN ====");
                }
                Thread.Sleep(60000);
            }
            return Task.CompletedTask;
        }

        private void Run(ams_WorkerService worker, AMWLogger logger)
        {
            var t = AMWUtil.Common.ClassType.GetClassType(worker.FullClassName);
            var exec = (BaseWorkerService)Activator.CreateInstance(t, new object[] { worker.ID.Value, logger, this._CommonHub });
            var task = Task.Run(() =>
            {
                return exec.Execute();
            });
            StartupWorkerService.Tasks.Add(new TTask() {worker = worker, task = task });
            
        }
    }
}
