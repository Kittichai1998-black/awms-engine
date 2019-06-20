using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWMSEngine.JobService;
using ProjectMRK.APIService;
using Quartz;

namespace ProjectMRK.Engine.JobService
{
    public class XMLReaderJob : BaseJobService
    {
        public override void ExecuteJob(IJobExecutionContext context, JobDataMap data)
        {
            ReadXMLFileAPI xml = new ReadXMLFileAPI(null);
            var res = xml.Execute(new { apiKey = "free01"});
        }
    }
}
