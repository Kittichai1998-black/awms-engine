using ADO.WMSDB;
using AMSModel.Criteria;
using AMWUtil.Common;
using AMWUtil.Logger;
using AWMSEngine.HubService;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectGCL.WorkerService
{
    public class Monitor_WCS_Machine_Worker : AWMSEngine.WorkerService.BaseWorkerService
    {
        public class TRes
        {
            public TData[] datas;
            public class TData
            {
                public string machine;
                public string command;
                public string status;
                public string status_color;
                public string arg1;
                public string arg2;
                public string arg3;
            }
        }

        public Monitor_WCS_Machine_Worker(long workerServiceID, AMWLogger logger, IHubContext<CommonMessageHub> commonHub) : base(workerServiceID, logger, commonHub)
        {
        }

        protected override void ExecuteEngine(Dictionary<string, string> options, VOCriteria buVO)
        {
            string db_env = buVO.SqlConnection.Database.Split("_").Last();
            buVO.Logger.IsLogging = false;
            string command = @$"select 
                        mcMst.code as machine,
                        mcObj.DV_Con_Comm as command,
                        mcObj.DV_Pre_Status as status,
                        concat(loc.code,' (',loc.Name,')') as arg1,
                        concat(
	                        iif(mcObj.IsOnline=1,'ON','OFF'),' | ',
	                        iif(mcObj.IsAuto=1,'AUTO','MANUAL')) as arg2,
                        concat('B: ',mcObj.DV_Pre_Battery) as arg3
					from 
                        (select * from [ACS_GCL_{db_env}].[dbo].acs_McMaster where status=1) mcMst inner join
                        [ACS_GCL_{db_env}].[dbo].act_McObject mcObj on mcMst.id=mcObj.id inner join
                        [ACS_GCL_{db_env}].[dbo].acs_Location loc on loc.id=mcObj.Cur_Location_ID";

            var _res = DataADO.GetInstant().QueryString<TRes.TData>(command, null, buVO).ToArray();
            TRes res = new TRes() { datas = _res };
            this.CommonMsgHub.Clients.All.SendAsync(options["_hubname"], res.Json());
        }
    }
}
