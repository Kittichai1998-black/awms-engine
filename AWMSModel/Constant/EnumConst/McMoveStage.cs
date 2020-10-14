using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Constant.EnumConst
{
    public enum McMoveStage
    {
        Font = 1,
        Back = 1 << 2,
        Left = 1 << 3,
        Right = 1 <<4,
        Up = 1 << 5,
        Down = 1 << 6,
    }
}
