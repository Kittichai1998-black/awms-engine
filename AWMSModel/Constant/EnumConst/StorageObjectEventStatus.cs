using System;
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
        PICKING = 15,
        PICKED = 16,
        CONSOLIDATING = 17,
        CONSOLIDATED = 18,

        REMOVING = 21,
        REMOVED = 22,
        REJECTING = 23,
        REJECTED = 24,
        ADJUSTING = 25,
        ADJUSTED = 26,

        ISSUING = 31,
        ISSUED = 32,
        SHIPPING = 33,
        SHIPPED = 34
    }
}
