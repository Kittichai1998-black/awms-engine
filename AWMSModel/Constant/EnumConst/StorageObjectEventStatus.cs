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
        //-------------------Pallet
        INACTIVE = 0,
        ACTIVE = 1,
        REMOVE = 2,
        DONE = 3,

        //-------------------Pack Inbound
        NEW = 10,
        RECEIVING = 11,
        [StorageObjectEventStatusAttr(IsPutawayBypassASRS = true)]
        RECEIVED = 12,
        AUDITING = 13,
        [StorageObjectEventStatusAttr(IsPutawayBypassASRS = true)]
        AUDITED = 14,
        COUNTING = 15,
        [StorageObjectEventStatusAttr(IsPutawayBypassASRS = true)]
        COUNTED = 16,


        //-------------------Pack Remove
        REMOVING = 21,
        REMOVED = 22,
        CANCELING = 25,
        [StorageObjectEventStatusAttr(IsPutawayBypassASRS = true)]
        CANCELED = 26,

        REJECTING = 23,
        REJECTED = 24,


        //-------------------Pack Outbound
        ALLOCATING = 31,
        ALLOCATED = 32,
        PICKING = 33,
        PICKED = 34,
        CONSOLIDATING = 35,
        [StorageObjectEventStatusAttr(IsPutawayBypassASRS = true)]
        CONSOLIDATED = 36,
        COMPLETING = 37,
        COMPLETED = 38,




    }
}
