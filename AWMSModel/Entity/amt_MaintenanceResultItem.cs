using AWMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Entity
{
    public class amt_MaintenanceResultItem : BaseEntityCreateModify
    {
        public int MaintenanceResult_ID;
        public string ServiceResult;
        public string ServiceBy;
        public MaintenancePlanEventStatus EventStatus;
    }
}
