using AMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Criteria
{
    public class McCommand
    {
        public string McMaster_Code;
        public string Command;
        public string Location_Code;
        public List<McCommandCondition> Conditions;
        public class McCommandCondition
        {
            public string McCode;
            public bool IsKeepSto;

            public McObjectEventStatus EventStatus;
        }
    }
}
