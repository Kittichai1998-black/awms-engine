using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWMSEngine.JobService;
using ProjectMRK.APIService.Doc;
using Quartz;

namespace ProjectMRK.Engine.JobService
{
    public class ClosedDocumentJob : BaseJobService
    {
        public override void ExecuteJob(IJobExecutionContext context)
        {
            CloseDocumentJobAPI xml = new CloseDocumentJobAPI(null);
            var res = xml.Execute(new { apiKey = "free01" });
        }
    }
}
