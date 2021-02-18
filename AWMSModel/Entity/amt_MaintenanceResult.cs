using AMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Entity
{
    public class amt_MaintenanceResult : BaseEntitySTD
    {
        public long MaintenancePlan_ID;
        public int Warehouse_ID;
        public MaintenancePlanEventStatus EventStatus;
        public DateTime MaintenanceDate;
        public List<amt_MaintenanceResultItem> maintenanceItems;
    }
}
