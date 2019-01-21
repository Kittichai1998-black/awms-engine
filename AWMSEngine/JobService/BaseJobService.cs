using Quartz;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.JobService
{
    public abstract class BaseJobService : IJob
    {
        public abstract void ExecuteJob(IJobExecutionContext context);

        public Task Execute(IJobExecutionContext context)
        {
            this.ExecuteJob(context);
            return null;
        }
    }
}
