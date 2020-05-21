using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Constant.EnumConst
{
    public class StorageObjectEventStatusAttr : Attribute
    {
        public bool IsPutawayBypassASRS { get; set; } = false;
    }
    public enum StorageObjectEventStatus
    {
        //Pallet
        ACTIVE = 0,
        INACTIVE = 1,
        REMOVE = 2,
        DONE = 3,

        //Pack
        NEW = 100,
        RECEIVING = 101,
        [StorageObjectEventStatusAttr(IsPutawayBypassASRS = true)]
        RECEIVED = 102,
        AUDITING = 103,
        [StorageObjectEventStatusAttr(IsPutawayBypassASRS = true)]
        AUDITED = 104,
        COUNTING = 105,
        [StorageObjectEventStatusAttr(IsPutawayBypassASRS = true)]
        COUNTED = 106,

        ALLOCATING = 151,
        ALLOCATED = 152,
        PICKING = 153,
        PICKED = 154,
        CONSOLIDATING = 155,
        [StorageObjectEventStatusAttr(IsPutawayBypassASRS = true)]
        CONSOLIDATED = 156,
        LOADING = 153,
        LOADED = 154,

        REMOVING = 201,
        REMOVED = 202,
        CANCELING = 203,
        [StorageObjectEventStatusAttr(IsPutawayBypassASRS = true)]
        CANCELED = 204,

        SHIPPING = 301,
        SHIPPED = 302,


    }
}
