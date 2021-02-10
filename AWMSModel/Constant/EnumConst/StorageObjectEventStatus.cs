using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Constant.EnumConst
{
    public class StorageObjectEventStatusAttr : Attribute
    {
        public bool IsPutawayBypassASRS { get; set; } = false;
    }
    public enum StorageObjectEventStatus
    {
        //-------------------Pallet
        BASE_INACTIVE = 0,
        BASE_ACTIVE = 1,
        BASE_REMOVE = 2,
        BASE_DONE = 3,

        //-------------------Pack Inbound
        PACK_NEW = 10,
        PACK_RECEIVING = 11,
        [StorageObjectEventStatusAttr(IsPutawayBypassASRS = true)]
        PACK_RECEIVED = 12,
        [StorageObjectEventStatusAttr(IsPutawayBypassASRS = true)]
        PACK_AUDITING = 13,
        [StorageObjectEventStatusAttr(IsPutawayBypassASRS = true)]
        PACK_AUDITED = 14,
        [StorageObjectEventStatusAttr(IsPutawayBypassASRS = true)]
        PACK_COUNTING = 15,
        [StorageObjectEventStatusAttr(IsPutawayBypassASRS = true)]
        PACK_COUNTED = 16,


        //-------------------Pack Remove
        PACK_REMOVING = 21,
        PACK_REMOVED = 22,
        PACK_CANCELING = 25,
        [StorageObjectEventStatusAttr(IsPutawayBypassASRS = true)]
        PACK_CANCELED = 26,

        PACK_REJECTING = 23,
        PACK_REJECTED = 24,


        //-------------------Pack Outbound
        PACK_ALLOCATING = 31,
        PACK_ALLOCATED = 32,
        PACK_PICKING = 33,
        PACK_PICKED = 34,
        PACK_CONSOLIDATING = 35,
        [StorageObjectEventStatusAttr(IsPutawayBypassASRS = true)]
        PACK_CONSOLIDATED = 36,
        PACK_COMPLETING = 37,
        PACK_COMPLETED = 38,




    }
}
