using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Quartz;

namespace AWMSEngine.JobService
{
    public class DashboardSignalRJob : BaseJobService
    {
        public override void ExecuteJob(IJobExecutionContext context, JobDataMap data)
        {
        }
    }
}
