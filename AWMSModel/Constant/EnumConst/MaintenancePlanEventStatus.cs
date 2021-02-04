﻿using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Constant.EnumConst
{
    public enum MaintenancePlanEventStatus
    {
        NEW = 10,
        WORKING = 11,
        WORKED = 12,

        REMOVING = 21,
        REMOVED = 22,
        REJECTING = 23,
        REJECTED = 24,

        CLOSING = 31,
        CLOSED = 32,

    }
}
