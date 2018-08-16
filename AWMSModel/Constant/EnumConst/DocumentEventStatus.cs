using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Constant.EnumConst
{
    public enum DocumentEventStatus
    {
        NEW = 10,
        ONPROGRESS = 11,
        CLOSING = 20,
        CLOSED = 21,
        REJECTING = 22,
        REJECTED = 23
    }
}
