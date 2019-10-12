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
        private const string CF_KEY_KEYS = "COMMON_DASHBOARD_KEYS";
        private const string CF_KEY_DELAY = "COMMON_DASHBOARD_DELAY";
        private const string CF_KEY_SPNAME = "COMMON_DASHBOARD_SPNAME_{0}";
        private const string CF_KEY_PARAM = "COMMON_DASHBOARD_PARAM_{0}";
        private const string CF_KEY_HUBNAME = "COMMON_DASHBOARD_HUBNAME_{0}";
        private const string CF_KEY_DELAY2 = "COMMON_DASHBOARD_DELAY_{0}";

        private readonly ILogger<CommonDashboardWorker> logger;
        private readonly IHubContext<CommonMessageHub> commonMsgHub;

        public CommonDashboardWorker(ILogger<CommonDashboardWorker> logger, IHubContext<CommonMessageHub> clockHub)
        {
            this.logger = logger;
            this.commonMsgHub = clockHub;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            string[] keys = ADO.StaticValue.StaticValueManager.GetInstant().GetConfigValue(CF_KEY_KEYS).Split(',');
            int delay = ADO.StaticValue.StaticValueManager.GetInstant().GetConfigValue(CF_KEY_DELAY).GetTry<int>() ?? 0;

            if (!stoppingToken.IsCancellationRequested)
            {
                foreach(string key in keys)
                {
                    if (string.IsNullOrWhiteSpace(key)) continue;
                    var spname = ADO.StaticValue.StaticValueManager.GetInstant().GetConfigValue(string.Format(CF_KEY_SPNAME, key));
                    var param = ADO.StaticValue.StaticValueManager.GetInstant().GetConfigValue(string.Format(CF_KEY_PARAM, key));
                    var hubname = ADO.StaticValue.StaticValueManager.GetInstant().GetConfigValue(string.Format(CF_KEY_HUBNAME, key));
                    int? deley2 = ADO.StaticValue.StaticValueManager.GetInstant().GetConfigValue(string.Format(CF_KEY_DELAY2, key)).GetTry<int>();
                    var task = Task.Run(() =>
                    {
                        while (true)
                        {
                            try
                            {
                                Dapper.DynamicParameters parameter = new Dapper.DynamicParameters();
                                AMWUtil.Common.ObjectUtil.QryStrToDictionary(param).ToList().ForEach(x =>
                                {
                                    parameter.Add(x.Key, x.Value);
                                });
                                var res = ADO.DataADO.GetInstant().QuerySP(spname, parameter, null);
                                commonMsgHub.Clients.All.SendAsync(hubname, res.Json());
                            }
                            catch
                            {
                            }
                            finally
                            {
                                Thread.Sleep(deley2 ?? delay);
                            }
                        }
                    });
                };
            }
            
        }
    }
}
