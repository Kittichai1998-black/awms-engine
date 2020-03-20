using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Constant.EnumConst
{
    public enum DocumentEventStatus
    {
        NEW = 10,
        WORKING = 11,
        WORKED = 12,

        APPROVING = 13,
        APPROVED = 14,

        REMOVING = 21,
        REMOVED = 22,
        REJECTING = 23,
        REJECTED = 24,

        CLOSING = 31,
        CLOSED = 32,
    }
}
