using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Constant.EnumConst
{
    public enum DocumentTypeID
    {
        GOODS_RECEIVED = 1001,//GR
        GOODS_ISSUED = 1002,//GI
        INTERNAL_GOODS_RECEIVED = 1003,//IGR
        INTERNAL_GOODS_ISSUED = 1004,//IGI
        WAREHOUSE_MOVING = 1005,//WMV
        WAREHOUSE_TRANSFER = 1006,//WTF
        BRANCH_TRANSFERS = 1007,//BTF
        PICKING = 1008,//PK
        CONSOLIDATION = 1009,//CS
        SHIPPING = 1011,//SP
        LOADING = 1012,//LD
        GOODS_RECEIVED_CORRECTIONS = 2001,//GRC
        GOODS_ISSUED_CORRECTIONS = 2002,//GIC
        STOCK_CORRECTIONS = 2003,//SLC
        STOCK_AUDIT = 2004,//SA
        DISCOUNTS = 3001,//DC
        ASSEMBLIES = 3002,//AS
    }
}
