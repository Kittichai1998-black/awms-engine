using AWMSEngine.ADO;
using AWMSEngine.HubService;
using AWMSModel.Criteria;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.ScheduleService.DailyStockTransaction
{
    public class DailyStockTransactionReport : BaseScheduleService
    {
        public override void ExecuteEngine(Dictionary<string, string> options, VOCriteria buVO)
        {
            var DailyData = new DataADO();

            var param = new Dapper.DynamicParameters();
            param.Add("dateFrom", DateTime.Now.AddDays(-1).ToShortDateString());
            param.Add("dateTo", DateTime.Now.ToShortDateString());
            //param.Add("dateFrom", "2020-05-01");
            //param.Add("dateTo", "2020-07-01");
            param.Add("docType", options["DocumentType"]);

            var res = DailyData.QuerySP("RP_DAILY_STO", param, buVO);
            new DailyNotify().Execute(buVO.Logger, buVO, new
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
