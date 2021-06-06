using ADO.WMSDB;
using AWMSEngine.Controllers.V2;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectGCL.APIService.v2
{
    public class A10_3_WCS_Monitor_Front : AWMSEngine.APIService.BaseAPIService
    {
        public class TReq
        {
            public string app_name;
            public List<string> machines;
        }
        public class TRes
        {
            public TData[] datas;
            public class TData
            {
                public string machine;
                public string command;
                public string status;
                public string message;
                public string arg1;
                public string arg2;
                public string arg3;
            }
        }

        public A10_3_WCS_Monitor_Front(BaseController controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize, false)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            string db_env = BuVO.SqlConnection.Database.Split("_").Last();
            TReq req = AMWUtil.Common.ObjectUtil.DynamicToModel<TReq>(this.RequestVO);
            Dapper.DynamicParameters datas = new Dapper.DynamicParameters();
            datas.Add("app_name", req.app_name);
            datas.Add("machines", string.Join(",",req.machines.ToArray()));
            var _res = DataADO.GetInstant().QueryString<TRes.TData>
                (@$"select 
                        mcMst.code as machine,
                        mcObj.DV_Con_Comm as command,
                        mcObj.DV_Pre_Status as status,
                        concat(loc.code,' (',loc.Name,')') as arg1,
                        concat(
	                        iif(mcObj.IsOnline=1,'ON','OFF'),' | ',
	                        iif(mcObj.IsAuto=1,'AUTO','MANUAL')) as arg2,
                        concat('B: ',mcObj.DV_Pre_Battery) as arg3
					from 
                        (select * from [ACS_GCL_{db_env}].[dbo].acs_McMaster where status=1 and GroupName=@app_name) mcMst inner join
                        string_split(',',@machines) mc on mc.value=mcMst.Code inner join
                        [ACS_GCL_{db_env}].[dbo].act_McObject mcObj on mcMst.id=mcObj.id inner join
                        [ACS_GCL_{db_env}].[dbo].acs_Location loc on loc.id=mcObj.Cur_Location_ID", datas, BuVO).ToArray();

            TRes res = new TRes() { datas = _res };
            return res;
        }
    }
}
