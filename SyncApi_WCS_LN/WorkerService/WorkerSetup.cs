﻿using Microsoft.Extensions.Hosting;
using SyncApi_WCS_LN.ADO;
using SyncApi_WCS_LN.Const;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace SyncApi_WCS_LN.WorkerService
{
    public class WorkerSetup : BackgroundService
    {
        protected override Task ExecuteAsync(CancellationToken stoppingToken)
        {
            string[] api_names = ConfigADO.Post2wmsConfigs[ConfigString.KEY_POST2WMS_APINAMES].Split(",");
            foreach(var api_name in api_names)
            {
                string api_url = ConfigADO.Post2wmsConfigs[string.Format(ConfigString.KEY_POST2WMS_APIURL, api_name)];
                string sp_request = ConfigADO.Post2wmsConfigs[string.Format(ConfigString.KEY_POST2WMS_SP_GET_REQUEST, api_name)];
                string sp_update = ConfigADO.Post2wmsConfigs[string.Format(ConfigString.KEY_POST2WMS_SP_UPDATE_RESULT, api_name)];
                var exec = new WorkerPost2WMS(sp_request, sp_update, api_url);
                Task t = Task.Run(() =>
                {
                    exec.Run();
                });
            }
            return null;
        }
    }
}