using AMSModel.Criteria;
using AWMSEngine.HubService;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectDOHOME.WorkerService
{
    public class ReadFTP_TestWork : AWMSEngine.WorkerService.BaseWorkerService
    {
        public ReadFTP_TestWork(long workerServiceID, IHubContext<CommonMessageHub> commonHub) : base(workerServiceID, commonHub)
        {
        }

        protected override void ExecuteEngine(Dictionary<string, string> options, VOCriteria buVO)
        {
            var a = options["a"];
            StreamReader read = new StreamReader("D:/files/*.json");
            
        }
    }
}
