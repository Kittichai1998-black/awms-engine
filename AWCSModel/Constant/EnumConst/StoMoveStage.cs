using System;
using System.Collections.Generic;
using System.Text;

namespace AWCSModel.Constant.EnumConst
{
    public enum StoMoveStage
    {
        PutFont = 1,
        PutBack = 1 << 2,
        PutLeft = 1 << 3,
        PutRight = 1 << 4,
        PutUp = 1 << 5,
        PutDown = 1 << 6,

        ReceiveFont = 1 << 11,
        ReceiveBack = 1 << 12,
        ReceiveLeft = 1 << 13,
        ReceiveRight = 1 << 14,
        ReceiveUp = 1 << 15,
        ReceiveDown = 1 << 16,

        PutFontX2 = 1 << 21,
        PutBackX2 = 1 << 22,
        PutLeftX2 = 1 << 23,
        PutRightX2 = 1 << 24,
        PutUpX2 = 1 << 25,
        PutDownX2 = 1 << 26,

        ReceiveFontX2 = 1 << 31,
        ReceiveBackX2 = 1 << 32,
        ReceiveLeftX2 = 1 << 33,
        ReceiveRightX2 = 1 << 34,
        ReceiveUpX2 = 1 << 35,
        ReceiveDownX2 = 1 << 36,
    }
}
