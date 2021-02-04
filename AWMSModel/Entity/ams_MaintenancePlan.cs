using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Entity
{
    public class ams_MaintenancePlan : BaseEntitySTD
    {
        public DateTime StartPlanDate;
        public int? NextPlanDay;
        public int? NextPlanMonth;
    }
}
