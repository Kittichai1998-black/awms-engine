using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Constant.EnumConst
{
    public enum StorageObjectEventStatus
    {
        //Pallet
        ACTIVE = 0,
        INACTIVE = 1,
        REMOVE = 2,
        DOEN = 3,

        //Pack
        NEW = 100,
        RECEIVING = 101,
        RECEIVED = 102,
        AUDITING = 103,
        AUDITED = 104,
        COUNTING = 105,
        COUNTED = 106,

        ALLOCATING = 151,
        ALLOCATED = 152,
        PICKING = 153,
        PICKED = 154,
        CONSOLIDATING = 155,
        CONSOLIDATED = 156,
        LOADING = 153,
        LOADED = 154,

        REMOVING = 201,
        REMOVED = 202,
        CANCELING = 203,
        CANCELED = 204,

        SHIPPING = 301,
        SHIPPED = 302,


    }
}
