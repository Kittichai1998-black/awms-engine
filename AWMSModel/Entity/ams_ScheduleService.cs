using AWMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Entity
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
