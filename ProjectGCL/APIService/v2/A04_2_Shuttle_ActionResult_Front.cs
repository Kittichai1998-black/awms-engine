using AWMSEngine.Controllers.V2;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectGCL.APIService.v2
{
    public class A04_2_Shuttle_ActionResult_Front : AWMSEngine.APIService.BaseAPIService
    {
        public class TReq
        {
            public int mode;
        }

        public A04_2_Shuttle_ActionResult_Front(BaseController controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize, false)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();

            TReq req = AMWUtil.Common.ObjectUtil.DynamicToModel<TReq>(this.RequestVO);

            Dapper.DynamicParameters datas = new Dapper.DynamicParameters();
            datas.Add("mode", req.mode);

            var res = ADO.WMSDB.DataADO.GetInstant().QuerySP<dynamic>("SP_Shuttle_ActionResult_Front", datas, BuVO);

            return new { datas = res };
        }
    }
}
