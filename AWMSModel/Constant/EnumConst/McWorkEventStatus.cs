using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Constant.EnumConst
{
    public enum McWorkEventStatus
    {
        IN_QUEUE = 10,
        ACTIVE_WORKING = 11,
        ACTIVE_WORKED = 12,
        ACTIVE_RECEIVE = 13,
        ACTIVE_KEEP = 19,
        REMOVE_QUEUE = 22,
        DONE_QUEUE = 32,
    }
}
