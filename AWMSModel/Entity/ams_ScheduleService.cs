using AMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Entity
{
    public class ams_ScheduleService : BaseEntitySTD
    {
        public string CronExpressions;
        public string FullClassName;
        public string Options;
        public int Revision;
        public OnOffFlag OnOff;
    }
}
