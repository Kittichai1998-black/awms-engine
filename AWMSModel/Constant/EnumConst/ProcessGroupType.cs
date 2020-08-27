using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Constant.EnumConst
{
    public enum ProcessGroupType
    {
        TRANSFER = 1,
        FAST_TRANSFER = 2,
        CROSSDOCK = 3,
        PHYSICAL_COUNT = 4,
        CYCLE_COUNT = 5,
        REWORK = 6,
        QUALITY_CONTROL = 7,
        DELIVERY_ORDER = 8,
        RETURN = 9,
        CORRECTIONS = 10,
        LOAD_RETURN = 11,
        MANUAL_TRANSFER = 12,
        RECALL = 13,
        WELFARE = 14,
        DONATE = 15,
        EXAMPLE = 16,
        RD = 17,
        OTHER = 99
    }
}
