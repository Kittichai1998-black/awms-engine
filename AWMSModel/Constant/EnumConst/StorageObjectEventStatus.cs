using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Constant.EnumConst
{
    public enum StorageObjectEventStatus
    {
        NEW = 10,
        RECEIVING = 11,
        RECEIVED = 12,
        AUDITING = 13,
        AUDITED = 14,
        ALLOCATE = 15,

        PICKING = 17,
        PICKED = 18,

        REMOVING = 21,
        REMOVED = 22,
        REJECTING = 23,
        REJECTED = 24,

        CONSOLIDATING = 31,
        CONSOLIDATED = 32,
        LOADING = 33,
        LOADED = 34,
        SHIPPING = 35,
        SHIPPED = 36,


        RETURN = 96,
        PARTIAL = 97,
        QC = 98,
        HOLD = 99
    }
}
