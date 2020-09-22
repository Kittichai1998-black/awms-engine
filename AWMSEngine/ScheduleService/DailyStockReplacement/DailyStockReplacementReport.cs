using AWMSEngine.ADO;
using AWMSEngine.HubService;
using AWMSModel.Criteria;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.ScheduleService.DailyStockReplacement
{
    public class DailyStockReplacementReport : BaseScheduleService
    {
        public override void ExecuteEngine(Dictionary<string, string> options, VOCriteria buVO)
        {
            var DailyData = new DataADO();

            var param = new Dapper.DynamicParameters();

            var res = DailyData.QuerySP("RP_DAILY_STOCK_REPLACEMENT", param, buVO);
            new DailyStockReplacement().Execute(buVO.Logger, buVO, new
            {
                Title = options["Title"], 
                Message = res,
                Signature = !options.ContainsKey("Sigature") ? null : options["Sigature"],
                Tag1 = !options.ContainsKey("Tag1") ? null : options["Tag1"],
                Tag2 = !options.ContainsKey("Tag2") ? null : options["Tag2"],
                Code = options["Code"]
            });
        }
    }
}
