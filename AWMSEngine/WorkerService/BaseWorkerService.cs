using AMWUtil.Logger;
using AWMSEngine.HubService;
using AWMSModel.Constant.EnumConst;
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
    public abstract class BaseWorkerService
    {
        protected long WorkerServiceID { get; set; }
        protected AMWLogger Logger { get; set; }
        protected readonly IHubContext<CommonMessageHub> CommonMsgHub;
        private IHubContext<CommonMessageHub> commonHub;

        protected abstract void ExecuteEngine(Dictionary<string,string> options, VOCriteria buVO);

        public BaseWorkerService(long workerServiceID, AMWLogger logger, IHubContext<CommonMessageHub> commonHub)
        {
            this.CommonMsgHub = commonHub;
            this.WorkerServiceID = workerServiceID;
            this.Logger = logger;
        }

        protected BaseWorkerService(long workerServiceID, IHubContext<CommonMessageHub> commonHub)
        {
            WorkerServiceID = workerServiceID;
            this.commonHub = commonHub;
        }

        public Task Execute()
        {
            VOCriteria buVO = new VOCriteria();
            buVO.Set(AWMSModel.Constant.StringConst.BusinessVOConst.KEY_LOGGER, this.Logger);
            var job = ADO.WMSStaticValue.StaticValueManager.GetInstant().WorkerService.FirstOrDefault(x => x.ID == this.WorkerServiceID);
            string prefixLog = "[" + job.Code + "(" + job.ID + ")] ";
            var options = AMWUtil.Common.ObjectUtil.QryStrToDictionary(job.Options);
            this.Logger.LogInfo(prefixLog + "[Begin] Option=" + job.Options);
            int logRunTimeMS = 60000;
            while (true)
            {
                if (job == null) break;
                try
                {
                    this.ExecuteEngine(options, buVO);
                    if (logRunTimeMS >= 60000)
                    {
                        logRunTimeMS -= 60000;
                        this.Logger.LogInfo(prefixLog + "Runing...");
                    }
                }
                catch (Exception ex)
                {
                    this.Logger.LogError(prefixLog + ex.Message);
                    //this.Logger.LogError(prefixLog + ex.StackTrace);
                }
                finally
                {
                    logRunTimeMS += job.SleepMS;
                    Thread.Sleep(job.SleepMS);
                    //await Task.Delay(job.SleepMS);
                }
            }
            this.Logger.LogInfo(prefixLog + "Ending... (job not active)");
            return Task.CompletedTask;
        }
    }
}
