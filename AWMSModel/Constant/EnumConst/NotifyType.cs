using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Constant.EnumConst
{
    public enum NotifyType
    {
        Info = 1,
        Success = 2,
        Error = 3,
        Warning = 4
    }
    public enum NotifyPriority
    {
        Normal = 1,
        Critical = 2,
    }
    public enum NotifyPlatform
    {
        Email = 1,
        Line = 2,
    }
}
