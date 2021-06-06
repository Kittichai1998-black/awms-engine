using ADO.WMSDB;
using AWMSEngine.Controllers.V2;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectGCL.APIService.v2
{
    public class A06_Shuttle_List_Front : AWMSEngine.APIService.BaseAPIService
    {
        public class TRes
        {
            public string warehouse;
            public string location;
            public string shuttle;
            public string online;
        }

        public A06_Shuttle_List_Front(BaseController controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize, false)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            string db_env = BuVO.SqlConnection.Database.Split("_").Last();
            //var res = DataADO.GetInstant().QuerySP<TRes>("RP_A06_Shuttle_List_Front", null, BuVO);
            string command = @$"
	            SELECT 
		
		            concat(iif(obj.IsOnline=1,'ON','OFF')
		            ,' | C:',obj.DV_Con_Comm
		            ,' | S:',obj.DV_Pre_Status
		            ,' | B:',cast(obj.DV_Pre_Battery as decimal(5,2))
		            ,' | L:',right(loc.Code,6)
		            ,' | Z:',obj.DV_Pre_Zone) as online,
		            wh.Name as warehouse,
		            mst.Code as shuttle,
		            loc.Name as location
	            from
	            (select * from ACS_GCL_{db_env}.dbo.acs_McMaster where Code like 'SHU%' and Status=1) mst inner join
	            ACS_GCL_{db_env}.dbo.act_McObject obj on obj.McMaster_ID=mst.ID and obj.Status=1 inner join
	            ACS_GCL_{db_env}.dbo.acs_Location loc on loc.ID=obj.Cur_Location_ID inner join
	            ACS_GCL_{db_env}.dbo.acs_Area ar on ar.ID=loc.Area_ID inner join
	            ACS_GCL_{db_env}.dbo.acs_Warehouse wh on wh.ID=ar.Warehouse_ID";
            var res = DataADO.GetInstant().QueryString<TRes>(command, null, BuVO);
            return res;
        }
    }
}
