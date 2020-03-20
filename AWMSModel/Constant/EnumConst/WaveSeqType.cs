using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Constant.EnumConst
{
    public enum WaveSeqType
    {
        ALLOCATE = StorageObjectEventStatus.ALLOCATE,
        PICKED = StorageObjectEventStatus.PICKED,
        CONSOLIDATED = StorageObjectEventStatus.CONSOLIDATED,
        LOADED = StorageObjectEventStatus.LOADED,
        SPHIPED = StorageObjectEventStatus.SHIPPED
    }
}
