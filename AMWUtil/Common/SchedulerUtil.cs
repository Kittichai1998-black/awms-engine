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
        public static Dictionary<string, string> MonitorJobs;
        public class JobRunTemp<IJobRun> : IJob
            where IJobRun : IJob
        {
            private IJobRun _exec;
            public JobRunTemp()
            {
                this._exec = (IJobRun)Activator.CreateInstance(typeof(IJobRun), null);
            }
            public Task Execute(IJobExecutionContext context)
            {
                if (SchedulerUtil.MonitorJobs.ContainsKey(context.JobDetail.Key.Name + "-" + this._exec.GetType().Name))
                {
                    SchedulerUtil.MonitorJobs[context.JobDetail.Key.Name + "-" + this._exec.GetType().Name] = DateTime.Now.ToString("dd-MM-yyyy hh:mm:ss");
                }
                else
                {
                    SchedulerUtil.MonitorJobs.Add(context.JobDetail.Key.Name + "-" + this._exec.GetType().Name, DateTime.Now.ToString("dd-MM-yyyy hh:mm:ss"));
                }
                this._exec.Execute(context);
                return null;
            }
        }
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
            scheduler.ScheduleJob(job, trigger);
            scheduler.Start();

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
