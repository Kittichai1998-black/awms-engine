using ADO.WMSDB;
using AWMSEngine.Controllers.V2;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectGCL.APIService.v2
{
    public class A10_WCS_List_AppName_Front : AWMSEngine.APIService.BaseAPIService
    {
        public class TSP
        {
            public string app_name;
            public string machine;
        }
        public class TRes
        {
            public TData[] datas;
            public class TData
            {
                public string app_name;
                public string[] machines;
            }
        }

        public A10_WCS_List_AppName_Front(BaseController controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize, false)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            string db_env = BuVO.SqlConnection.Database.Split("_").Last();
            var _res = DataADO.GetInstant().QueryString<TSP>
                ("select GroupName as app_name,code as machine from [ACS_GCL_" + db_env + "].[dbo].acs_McMaster where status=1", null, BuVO);
            TRes res = new TRes();
            res.datas = _res.GroupBy(x => x.app_name)
                .Select(x => new TRes.TData() { app_name = x.Key, machines = x.Select(y => y.machine).ToArray() })
                .ToArray();
            return res;
        }
    }
}
