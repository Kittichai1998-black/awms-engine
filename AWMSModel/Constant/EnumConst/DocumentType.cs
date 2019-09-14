using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Constant.EnumConst
{
    public enum DocumentTypeID
    {
        GOODS_RECEIVED = 1001,//GR

        GOODS_ISSUED = 1002,//GI
        GOODS_MOVING = 1005,//GM
        GOODS_TRANSFER = 1006,//GT
        GOODS_SHIPPING = 1011,//GS
        GOODS_LOADING = 1012,//GL
        AUDIT = 2004,//AD
        //LOADING = 10012,
        SUPER_GOODS_RECEIVED = 1101,//SGR
        SUPER_GOODS_ISSUED = 1102,//SGI
    }
}
