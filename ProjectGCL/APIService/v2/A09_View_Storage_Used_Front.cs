using ADO.WMSDB;
using AWMSEngine.Controllers.V2;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectGCL.APIService.v2
{
    public class A09_View_Storage_Used_Front : AWMSEngine.APIService.BaseAPIService
    {
        public class TReq
        {
            public string wh;
            public int lv;
        }

        public A09_View_Storage_Used_Front(BaseController controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize, false)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            TReq req = AMWUtil.Common.ObjectUtil.DynamicToModel<TReq>(this.RequestVO);
            var datas = DataADO.GetInstant().CreateDynamicParameters(req);
            var res = DataADO.GetInstant().QuerySP<dynamic>("RP_A09_View_Storage_Used_Front", datas, BuVO);
            return res;
        }
    }
}
