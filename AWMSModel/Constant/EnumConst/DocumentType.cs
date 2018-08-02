using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Constant.EnumConst
{
    public enum DocumentTypeID
    {
        GOODS_RECEIVED = 1001,
        GOODS_ISSUED = 1002,
        INTERNAL_GOODS_RECEIVED = 1003,
        INTERNAL_GOODS_ISSUED = 1004,
        WAREHOUSE_MOVING = 1005,
        WAREHOUSE_TRANSFER = 1006,
        BRANCH_TRANSFERS = 1007,
        PICKING = 1008,
        CONSOLIDATION = 1009,
        SHIPPING = 1011,
        LOADING = 1012,
        GOODS_RECEIVED_CORRECTIONS = 2001,
        GOODS_ISSUED_CORRECTIONS = 2002,
        STOCK_LEVEL_CORRECTIONS = 2003,
        DISCOUNTS = 3001,
        ASSEMBLIES = 3002,
    }
}
