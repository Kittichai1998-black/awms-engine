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

        ALLOCATING = 15,
        ALLOCATED = 16,

        PICKING = 17,
        PICKED = 18,
        CONSOLIDATING = 111,
        CONSOLIDATED = 112,
        LOADING = 113,
        LOADED = 114,

        REMOVING = 21,
        REMOVED = 22,
        REJECTING = 23,
        REJECTED = 24,

        SHIPPING = 31,
        SHIPPED = 32,


        RETURN = 96,
        PARTIAL = 97,
        QC = 98,
        HOLD = 99
    }
}
