using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Constant.EnumConst
{
    public enum PlcCommunicationType
    {
        [AMWUtil.Common.EnumValue(ValueString = "ADO.WCSPLC.PlcTestADO")]
        TEST = 0,
        [AMWUtil.Common.EnumValue(ValueString = "ADO.WCSPLC.PlcMxADO")]
        MX = 1,
        [AMWUtil.Common.EnumValue(ValueString = "ADO.WCSPLC.PlcKepwareADO")]
        KEPWARE = 2
    }
}
