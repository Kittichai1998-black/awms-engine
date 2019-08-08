using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AWMSEngine.HubService;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Hosting;
using Quartz;

namespace AWMSEngine.JobService
{
    public class DashboardSignalRJob : BaseJobService
    {
        public DashboardSignalRJob()
        {

        }

        public override void ExecuteJob(IJobExecutionContext context, JobDataMap data)
        {

            //var conn = new Microsoft.AspNetCore.SignalR.Client
            //var context = GlobalHost.ConnectionManager.GetHubContext<HubTest01>();
            //context.Clients.All.addMessage("Hello");
        }
    }
}
