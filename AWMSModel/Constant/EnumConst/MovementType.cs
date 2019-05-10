using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Constant.EnumConst
{
    public enum MovementType
    {
        RECEIVE_PRODUCTION = DocumentTypeID.GOODS_RECEIVED * 100 + 1,
        RECEIVE_PALLET_EMPTY = DocumentTypeID.GOODS_RECEIVED * 100 + 9
    }
}
