using AMWUtil.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Constant.EnumConst
{
    public enum EntityStatus
    {
        [EnumDisplay(Name = "Inactive", Order = 1)]
        INACTIVE = 0,
        [EnumDisplay(Name = "Active", Order = 2)]
        ACTIVE = 1,
        [EnumDisplay(Name = "Remove", Order = 3)]
        REMOVE = 2,
        [EnumDisplay(Name = "Done", Order = 4)]
        DONE = 3
    }
}
