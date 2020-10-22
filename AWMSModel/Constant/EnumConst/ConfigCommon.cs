using AMWUtil.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Constant.EnumConst
{
    public enum ConfigCommon
    {

        [EnumValueAttribute(ValueString = "FLOW.NOTIFY.Noti_Email_Sender")]
        Noti_Email_Sender,
        [EnumValueAttribute(ValueString = "FLOW.NOTIFY.Noti_Email_Sender_Password")]
        Noti_Email_Sender_Password,
        [EnumValueAttribute(ValueString = "FLOW.NOTIFY.Noti_Email_SMTP_Port")]
        Noti_Email_SMTP_Port,
        [EnumValueAttribute(ValueString = "FLOW.NOTIFY.Noti_Email_SMTP_Host")]
        Noti_Email_SMTP_Host,

        [EnumValueAttribute(ValueString = "PATH.IMG.PATH_PALLET_IMG")]
        PATH_FOLDER_IMAGES,

        [EnumValueAttribute(ValueString = "AUTHEN.TOKEN.TOKEN_EXPIRE_HR")]
        TOKEN_EXPIRE_HR,
        [EnumValueAttribute(ValueString = "AUTHEN.TOKEN.TOKEN_EXTEND_HR")]
        TOKEN_EXTEND_HR,

        [EnumValueAttribute(ValueString = "PERCENT.WEIGHT.PERCENT_WEIGHT_AUTO")]
        PERCENT_WEIGHT_AUTO,

        [EnumValueAttribute(ValueString = "SYSTEM.SYSTEM_CONFIG")]
        SEQ_WQ
    }
}
