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
    public abstract class BaseWorkerService : BackgroundService
    {
        protected readonly IHubContext<CommonMessageHub> CommonMsgHub;

        private static List<ams_WorkerService> _JobWorkerSetup = new List<ams_WorkerService>();
        public static void AddJobWorkerSetup(ams_WorkerService jobWorker)
        {
            _JobWorkerSetup.Add(jobWorker);
        }
        protected long WorkerServiceID { get; set; }

        private static readonly object _LockGetJobWorkerID = new object();

        protected abstract void ExecuteEngine(Dictionary<string,string> options, VOCriteria buVO);

        public BaseWorkerService(ILogger<CommonDashboardWorker> logger, IHubContext<CommonMessageHub> commonHub)
        {
            this.CommonMsgHub = commonHub;
            lock (_LockGetJobWorkerID)
            {
                this.WorkerServiceID = _JobWorkerSetup.First(x => x.FullClassName == this.GetType().FullName).ID.Value;
                _JobWorkerSetup.RemoveAll(x => x.ID == this.WorkerServiceID);
            }
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            VOCriteria buVO = new VOCriteria();
            var logger = AMWLoggerManager.GetLogger("worker." + this.WorkerServiceID, this.GetType().Name);
            buVO.Set(AWMSModel.Constant.StringConst.BusinessVOConst.KEY_LOGGER, logger);
            logger.LogInfo("######START######");
            while (!stoppingToken.IsCancellationRequested)
            { 
                var job = ADO.StaticValue.StaticValueManager.GetInstant().WorkerService.FirstOrDefault(x => x.ID == this.WorkerServiceID);

                if (job == null) break;
                try
                {
                    if (job.OnOff == AWMSModel.Constant.EnumConst.OnOffFlag.ON)
                    {
                        var options = AMWUtil.Common.ObjectUtil.QryStrToDictionary(job.Options);
                        this.ExecuteEngine(options, buVO);
                        //logger.LogInfo("ON");
                    }
                    else
                    {
                        //logger.LogInfo("OFF");
                    }
                }
                catch (Exception ex)
                {
                    logger.LogError(ex.Message);
                    logger.LogError(ex.StackTrace);
                }
                finally
                {
                    await Task.Delay(job.SleepMS);
                }
            }
            logger.LogInfo("######STOP######");
        }
    }
}
