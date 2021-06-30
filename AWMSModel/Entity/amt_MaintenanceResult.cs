using AMSModel.Constant.EnumConst;
using AMSModel.Entity;
using System;
using System.Collections.Generic;

namespace AWMSModel.Entity
{
    public class amt_MaintenanceResult : BaseEntitySTD
    {
        public long MaintenancePlan_ID;
        public int Warehouse_ID;
        public DateTime MaintenanceDate;
        public bool IsTicket;
        public MaintenancePlanEventStatus EventStatus;
        public List<amt_MaintenanceResultItem> maintenanceItems;
    }
}
