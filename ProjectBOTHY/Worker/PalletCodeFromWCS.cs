using AMWUtil.Common;
using AMWUtil.DataAccess.Http;
using AWMSEngine.HubService;
using AWMSEngine.WorkerService;
using AWMSModel.Criteria;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectBOTHY.Worker
{
    public class PalletCodeFromWCS : BaseWorkerService
    {
        public class TRes
        {
            public string baseCode;
        }

        public PalletCodeFromWCS(long workerServiceID, IHubContext<CommonMessageHub> commonHub) : base(workerServiceID, commonHub)
        {
        }

        protected override void ExecuteEngine(Dictionary<string, string> options, VOCriteria buVO)
        {
            var res = RESTFulAccess.SendJson<TRes>(null, "WCS", RESTFulAccess.HttpMethod.POST, new { });
            this.CommonMsgHub.Clients.All.SendAsync(options["_hubname"], res.Json());
        }
    }
}
