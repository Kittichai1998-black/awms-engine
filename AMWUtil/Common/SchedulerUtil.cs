using Quartz;
using Quartz.Impl;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace AMWUtil.Common
{
    public class SchedulerUtil
    {
        public static IJobDetail Start<TJobRun>(string cronExp, params KeyValuePair<string, object>[] jobDataMaps)
            where TJobRun : IJob
        {
            var scheduler = StdSchedulerFactory.GetDefaultScheduler().Result;
            var job = JobBuilder.Create<TJobRun>().Build();
            if (jobDataMaps != null)
                foreach (var data in jobDataMaps)
                {
                    job.JobDataMap.Add(data);
                }
            //"0/10 * * * * ?"
            var trigger = TriggerBuilder.Create().WithCronSchedule(cronExp).Build();
            scheduler.Start();
            scheduler.ScheduleJob(job, trigger);

            return job;
        }

        public static void DeleteJob<TJobRun>(params IJobDetail[] jobs)
            where TJobRun : IJob
        {
            var scheduler = StdSchedulerFactory.GetDefaultScheduler().Result;
            if (jobs != null)
                foreach (var job in jobs)
                    scheduler.DeleteJob(job.Key);

        }


    }
}
