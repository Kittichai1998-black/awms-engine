using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Constant.EnumConst
{
    public enum StorageObjectEventStatus
    {
        IDLE = 10,
        RECEIVING = 11,
        RECEIVED = 12,
        AUDITING = 13,
        AUDITED = 14,
        //ISSUING = 15,
        //ISSUED = 16,
        PICKING = 17,
        PICKED = 18,
        CONSOLIDATING = 111,
        CONSOLIDATED = 112,
        //MOVING = 113,
        //MOVED = 114,
        //TRANSFERING = 115,
        //TRANSFERED = 116,

        REMOVING = 21,
        REMOVED = 22,
        REJECTING = 23,
        REJECTED = 24,
        CORRECTING = 25,
        CORRECTED = 26,

        LOADING = 31,
        LOADED = 32,
        SHIPPING = 33,
        SHIPPED = 34,

        HOLD = 99
    }
}
