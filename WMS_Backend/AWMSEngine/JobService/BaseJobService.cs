using Quartz;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.JobService
{
    public abstract class BaseJobService : IJob
    {
        public abstract void ExecuteJob(IJobExecutionContext context, JobDataMap data);

        public Task Execute(IJobExecutionContext context)
        {
            this.ExecuteJob(context, context.JobDetail.JobDataMap);
            return null;
        }
    }
}
