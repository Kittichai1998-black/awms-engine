using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using OfficeOpenXml.Table.PivotTable;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.ScheduleService.Maintenance
{
    public class WeeklyMaintenancePlan : BaseScheduleService
    {
        public class TRes
        {
            public string Code;
            public string Name;
            public string Description;
            public DateTime NextDateMaintenance;
            public int TotalDays;
        }

        public override void ExecuteEngine(Dictionary<string, string> options, VOCriteria buVO)
        {
            var plans = ADO.DataADO.GetInstant().SelectBy<ams_MaintenancePlan>(new SQLConditionCriteria()
            {
                field="Status",
                value=EntityStatus.ACTIVE,
                operatorType=SQLOperatorType.EQUALS
            }, buVO);

            var now = DateTime.Now;
            var res = new List<TRes>();

            plans.ForEach(plan =>
            {
                var lastestPlan = ADO.DataADO.GetInstant().SelectBy<amt_MaintenanceResult>(new SQLConditionCriteria[]
                {
                    new SQLConditionCriteria("MaintenancePlan_ID", plan.ID, SQLOperatorType.EQUALS),
                }, buVO).OrderByDescending(x=> x.CreateTime).ToList();
                if(lastestPlan.Count == 0)
                {
                    var diffDate = plan.StartPlanDate.Subtract(now);
                    res.Add(new TRes()
                    {
                        Code = plan.Code,
                        Name = plan.Name,
                        Description = plan.Description,
                        NextDateMaintenance = plan.StartPlanDate,
                        TotalDays = diffDate.Days
                    });
                }
                else
                {
                    var nextDate = lastestPlan.First().CreateTime
                        .AddDays(plan.NextPlanDay == null ? 0 : plan.NextPlanDay.Value)
                        .AddMonths(plan.NextPlanMonth == null ? 0 : plan.NextPlanMonth.Value);
                    var diffDate = nextDate.Subtract(now);
                    res.Add(new TRes()
                    {
                        Code = plan.Code,
                        Name = plan.Name,
                        Description = plan.Description,
                        NextDateMaintenance = nextDate,
                        TotalDays = diffDate.Days
                    });
                }
            });

            if(res.Count > 0)
            {
                new WeeklyNotifyMaintenance().Execute(buVO.Logger, buVO, new
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
}
