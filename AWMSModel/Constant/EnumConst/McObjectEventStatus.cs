using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Constant.EnumConst
{
    public enum McObjectEventStatus
    {
        PLC_DISCONNECT = 0,
        IDEL = 10,
        WORK = 11,
        DONE = 32,
        ERROR = 99
    }
}
