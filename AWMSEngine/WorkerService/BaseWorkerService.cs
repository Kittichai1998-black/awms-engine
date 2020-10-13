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
    public abstract class BaseWorkerService
    {
        protected long WorkerServiceID { get; set; }
        protected readonly IHubContext<CommonMessageHub> CommonMsgHub;

        protected abstract void ExecuteEngine(Dictionary<string,string> options, VOCriteria buVO);

        public BaseWorkerService(long workerServiceID, IHubContext<CommonMessageHub> commonHub)
        {
            this.CommonMsgHub = commonHub;
            this.WorkerServiceID = workerServiceID;
        }

        public async Task ExecuteAsync()
        {
            var logger = AMWLoggerManager.GetLogger("worker." + this.WorkerServiceID, this.GetType().Name);
            VOCriteria buVO = new VOCriteria();
            buVO.Set(AWMSModel.Constant.StringConst.BusinessVOConst.KEY_LOGGER, logger);
            logger.LogInfo("######START######");
            logger.LogInfo("...WORKER...");
            while (true)
            { 
                var job = ADO.WMSStaticValue.StaticValueManager.GetInstant().WorkerService.FirstOrDefault(x => x.ID == this.WorkerServiceID);

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
            logger.LogInfo("######REMOVE######");
        }
    }
}
