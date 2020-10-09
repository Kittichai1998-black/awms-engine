using AWMSEngine.ADO.StaticValue;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.ScheduleService.Maintenance
{
    public class MaintenanceDay : BaseScheduleService
    {
        public class TRes : WeeklyMaintenancePlan.TRes {
            public long ID;
            public string Description;
            public int Warehouse_ID;
            public string Warehouse_Name;
        };
        public override void ExecuteEngine(Dictionary<string, string> options, VOCriteria buVO)
        {
            var plans = ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_MaintenancePlan>(new SQLConditionCriteria()
            {
                field = "Status",
                value = EntityStatus.ACTIVE,
                operatorType = SQLOperatorType.EQUALS
            }, buVO);

            var now = DateTime.Now;
            var res = new List<TRes>();

            plans.ForEach(plan =>
            {
                var lastestPlan = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_MaintenanceResult>(new SQLConditionCriteria[]
                {
                    new SQLConditionCriteria("MaintenancePlan_ID", plan.ID, SQLOperatorType.EQUALS),
                }, buVO).OrderByDescending(x => x.CreateTime).ToList();
                if (lastestPlan.Count == 0)
                {
                    var diffDate = plan.StartPlanDate.Subtract(now);
                    if(diffDate.Days == 0)
                    {
                        res.Add(new TRes()
                        {
                            ID = plan.ID.Value,
                            Code = plan.Code,
                            Name = plan.Name,
                            Description = plan.Description,
                            NextDateMaintenance = plan.StartPlanDate,
                            TotalDays = diffDate.Days,
                            Warehouse_ID = Convert.ToInt32(options["Warehouse_ID"]),
                            Warehouse_Name = StaticValueManager.GetInstant().Warehouses.Find(x=> x.ID.Value == Convert.ToInt32(options["Warehouse_ID"])).Name
                        });
                    }
                }
                else
                {
                    var nextDate = lastestPlan.First().CreateTime
                        .AddDays(plan.NextPlanDay == null ? 0 : plan.NextPlanDay.Value)
                        .AddMonths(plan.NextPlanMonth == null ? 0 : plan.NextPlanMonth.Value);
                    var diffDate = nextDate.Subtract(now);
                    if (diffDate.Days == 0)
                    {
                        res.Add(new TRes()
                        {
                            ID = plan.ID.Value,
                            Code = plan.Code,
                            Name = plan.Name,
                            Description = plan.Description,
                            NextDateMaintenance = nextDate,
                            TotalDays = diffDate.Days,
                            Warehouse_ID = Convert.ToInt32(options["Warehouse_ID"]),
                            Warehouse_Name = StaticValueManager.GetInstant().Warehouses.Find(x => x.ID.Value == Convert.ToInt32(options["Warehouse_ID"])).Name
                        });
                    }
                }
            });

            this.CreateMaintenanceJob(res, buVO);

            if(res.Count > 0)
            {
                new NotifyMaintenanceDay().Execute(buVO.Logger, buVO, new
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

        private void CreateMaintenanceJob(List<TRes> items, VOCriteria buVO)
        {
            var res = new List<amt_MaintenanceResult>();
            items.ForEach(item =>
            {
                var newJob = new amt_MaintenanceResult()
                {
                    MaintenancePlan_ID = item.ID,
                    Code = item.Code,
                    Name = item.Name,
                    Description = item.Description,
                    MaintenanceDate = item.NextDateMaintenance,
                    Status = EntityStatus.INACTIVE,
                    EventStatus = MaintenancePlanEventStatus.NEW,
                    ID = null,
                    Warehouse_ID = item.Warehouse_ID
                };

                ADO.WMSDB.DataADO.GetInstant().Insert(buVO, newJob);

                res.Add(newJob);
            });
        }
    }
}
