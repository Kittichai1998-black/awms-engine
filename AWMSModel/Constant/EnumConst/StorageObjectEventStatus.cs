﻿using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Constant.EnumConst
{
    public enum StorageObjectEventStatus
    {
        IDEL = 10,
        RECEIVING = 11,
        RECEIVED = 12,
        MOVING = 13,
        MOVED = 14,
        
        REMOVING = 21,
        REMOVED = 22,
        REJECTING = 23,
        REJECTED = 24,

        ISSUING = 31,
        ISSUED = 32,
        SHIPPING = 33,
        SHIPPED = 34,

    }
}
