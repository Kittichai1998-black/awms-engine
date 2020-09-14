using AMWUtil.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Constant.EnumConst
{
    public enum ConfigFlow
    {
        [EnumValueAttribute(ValueString = "FLOW.RECEIVE.{0}.USE_AUTO_CREATE_GR")]
        USE_AUTO_CREATE_GR,
        [EnumValueAttribute(ValueString = "FLOW.RECEIVE.{0}.USE_AUTO_CREATE_PA")]
        USE_AUTO_CREATE_PA,
        [EnumValueAttribute(ValueString = "FLOW.RECEIVE.{0}.AUDIT_STATUS_DEFAULT")]
        AUDIT_STATUS_DEFAULT,
        [EnumValueAttribute(ValueString = "FLOW.RECEIVE.{0}.HOLD_STATUS_DEFAULT")]
        HOLD_STATUS_DEFAULT,

        [EnumValueAttribute(ValueString = "FLOW.CLASSPLUGIN.SERVICE.{0}.")]
        CLASS_PLUGIN,
    }
}
