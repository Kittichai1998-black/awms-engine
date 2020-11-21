using AMWUtil.Common;
using AWMSEngine.APIService;
using AWMSEngine.Controllers.V2;
using ProjectBOTHY.Engine.FileGenerate;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectBOTHY.APIService
{
    public class StockDailyReportAPI : BaseAPIService
    {
        public StockDailyReportAPI(AWMSEngine.Controllers.V2.BaseController controllerAPI,int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {

            this.BeginTransaction();
            var req = ObjectUtil.DynamicToModel<StockDailyReport>(this.RequestVO);
            var res = new StockDailyReport().Execute(this.Logger, this.BuVO, req);
            return res;
        }
    }
}
