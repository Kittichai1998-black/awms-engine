﻿using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Constant.EnumConst
{
    public enum WorkQueueEventStatus
    {
        IDEL = 10,
        WORKING = 11,
        WORKED = 12,

        REMOVING = 21,
        REMOVED = 22,
        CANCELING = 23,
        CANCELED = 24,

        COMPLETING = 31,
        COMPLETIED = 32,

        WARNING = 90,
    }
}