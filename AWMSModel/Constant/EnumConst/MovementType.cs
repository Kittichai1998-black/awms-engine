using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Constant.EnumConst
{
    public enum MovementType
    {
        RECEIVE_PRODUCTION = DocumentTypeID.GOODS_RECEIVED * 100 + 1,
        RECEIVE_PALLET_EMPTY = DocumentTypeID.GOODS_RECEIVED * 100 + 9,
        FG_TRANSFER = 101,
        FG_FASTMOVE = 102,
        FG_CROSSDOCK = 103,
        FG_COUNTING = 111,
        FG_REWORK = 112,
        FG_QC = 113,
        EMP_TRANSFER = 201
    }
}
