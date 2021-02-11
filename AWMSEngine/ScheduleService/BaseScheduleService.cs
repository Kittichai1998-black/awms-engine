using AMWUtil.Logger;
using AMSModel.Criteria;
using AMSModel.Entity;
using Quartz;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.ScheduleService
{
    public abstract class BaseScheduleService : IJob
    {
        private static List<ams_ScheduleService> _ScheduleServiceSetup = new List<ams_ScheduleService>();
        public static void AddScheduleServiceSetup(ams_ScheduleService hubService)
        {
            _ScheduleServiceSetup.Add(hubService);
        }
        protected long ScheduleServiceID { get; set; }
        private static readonly object _LockGetScheduleServiceID = new object();
        public abstract void ExecuteEngine(Dictionary<string, string> options, VOCriteria buVO);


        public Task Execute(IJobExecutionContext context)
        {
            this.ScheduleServiceID = (long)context.MergedJobDataMap.Get("ScheduleServiceID");
            VOCriteria buVO = new VOCriteria();
            var logger = AMWLoggerManager.GetLogger("schedule." + this.ScheduleServiceID, this.GetType().Name);
            logger.LogInfo("######BEGIN######");
            buVO.Set(AMSModel.Constant.StringConst.BusinessVOConst.KEY_LOGGER, logger);
            var job = ADO.WMSStaticValue.StaticValueManager.GetInstant().ScheduleService.FirstOrDefault(x => x.ID == this.ScheduleServiceID);

            if (job == null) return Task.CompletedTask;
            try
            {
                if (job.OnOff == AMSModel.Constant.EnumConst.OnOffFlag.ON)
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
                logger.LogInfo("#####REMOVE######");
            }

            return Task.CompletedTask;
        }

    }
}
