using AMWUtil.Common;
using AWMSEngine.HubService;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace AWMSEngine.WorkerService
{
    public class CommonDashboardWorker : BackgroundService
    {
        private const string CF_KEY_INDEX = "COMMON_DASHBOARD_INDEX";
        private const string CF_KEY_DELAY = "COMMON_DASHBOARD_DELAY";
        private const string CF_KEY_SPNAME = "COMMON_DASHBOARD_SPNAME_{0}";
        private const string CF_KEY_PARAM = "COMMON_DASHBOARD_PARAM_{0}";
        private const string CF_KEY_HUBNAME = "COMMON_DASHBOARD_HUBNAME_{0}";

        private readonly ILogger<CommonDashboardWorker> logger;
        private readonly IHubContext<CommonMessageHub> commonMsgHub;

        public CommonDashboardWorker(ILogger<CommonDashboardWorker> logger, IHubContext<CommonMessageHub> clockHub)
        {
            this.logger = logger;
            this.commonMsgHub = clockHub;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            int idx = ADO.StaticValue.StaticValueManager.GetInstant().GetConfigValue(CF_KEY_INDEX).GetTry<int>() ?? 0;
            int delay = ADO.StaticValue.StaticValueManager.GetInstant().GetConfigValue(CF_KEY_DELAY).GetTry<int>() ?? 0;

            try
            {
                while (!stoppingToken.IsCancellationRequested)
                {
                    for (int i = 1; i <= idx; i++)
                    {
                        var spname = ADO.StaticValue.StaticValueManager.GetInstant().GetConfigValue(string.Format(CF_KEY_SPNAME, i));
                        var param = ADO.StaticValue.StaticValueManager.GetInstant().GetConfigValue(string.Format(CF_KEY_PARAM, i));
                        var hubname = ADO.StaticValue.StaticValueManager.GetInstant().GetConfigValue(string.Format(CF_KEY_HUBNAME, i));
                        Dapper.DynamicParameters parameter = new Dapper.DynamicParameters();
                        AMWUtil.Common.ObjectUtil.QryStrToDictionary(param).ToList().ForEach(x =>
                        {
                            parameter.Add(x.Key, x.Value);
                        });
                        var res = ADO.DataADO.GetInstant().QuerySP(spname, parameter, null);
                        await commonMsgHub.Clients.All.SendAsync(hubname, res.Json());
                    }
                    await Task.Delay(delay);
                }
            }
            catch (Exception e)
            {
                //throw new System.Exception("Not Enum Type.");
            }
        }
    }
}
