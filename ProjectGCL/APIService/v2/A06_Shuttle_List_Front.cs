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
            var res = DataADO.GetInstant().QuerySP<TRes>("RP_A06_Shuttle_List_Front", null, BuVO);
            return res;
        }
    }
}
