using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Constant.EnumConst
{
    public enum DocumentTypeID
    {
        GOODS_RECEIVED = 1001,//GR
        SUPER_GOODS_RECEIVED = 1101,//SGR

        GOODS_ISSUED = 1002,//GI
        SUPER_GOODS_ISSUED = 1102,//SGI
        GOODS_ISSUED_PICKING = 1202,//PGI
        GOODS_ISSUED_CONSOLIDATION = 1302,//CGI

        //INTERNAL_GOODS_RECEIVED = 1003,//IGR
        //INTERNAL_GOODS_ISSUED = 1004,//IGI
        WAREHOUSE_MOVING = 1005,//MV
        //WAREHOUSE_TRANSFER = 1006,//WT
        //BRANCH_TRANSFERS = 1007,//BT
        SHIPPING = 1011,//SP
        LOADING = 1012,//LD
        //GOODS_RECEIVED_CORRECTIONS = 2001,//GRC
        //GOODS_ISSUED_CORRECTIONS = 2002,//GIC
        STOCK_CORRECTIONS = 2003,//SC

        AUDIT = 2004,//AD

        //DISCOUNTS = 3001,//DC
        //ASSEMBLIES = 3002,//AS
    }
}
