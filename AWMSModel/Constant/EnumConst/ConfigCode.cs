using AMWUtil.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Constant.EnumConst
{
    public enum ConfigCode
    {
        /// <summary>API Code สำหรับ API File transfer SKUMasterType</summary>
        AFT_PATH_IN_SKUMASTERTYPE,
        /// <summary>API Code สำหรับ API File transfer SKUMasterType</summary>
        AFT_PATH_OUT_SKUMASTERTYPE_OUT,

        /// <summary>API Code สำหรับ API File transfer SKUMaster</summary>
        AFT_PATH_IN_SKUMASTER,
        /// <summary>API Code สำหรับ API File transfer SKUMaster</summary>
        AFT_PATH_OUT_SKUMASTER,

        /// <summary>API Code สำหรับ API File transfer Supplier</summary>
        AFT_PATH_IN_SUPPLIER,
        /// <summary>API Code สำหรับ API File transfer Supplier</summary>
        AFT_PATH_OUT_SUPPLIER,

        /// <summary>API Code สำหรับ API File transfer Customer</summary>
        AFT_CUSTOMER_PATH_IN,
        /// <summary>API Code สำหรับ API File transfer Customer</summary>
        AFT_CUSTOMER_PATH_OUT,


        /// <summary>File Pattern สำหรับ API File transfer SKUMasterType</summary>
        AFT_FILEPATTERN_SKUMASTERTYPE,
        /// <summary>File Pattern สำหรับ API File transfer SKUMaster</summary>
        AFT_FILEPATTERN_SKUMASTER,
        /// <summary>File Pattern สำหรับ API File transfer Supplier</summary>
        AFT_FILEPATTERN_SUPPLIER,
        /// <summary>File Pattern สำหรับ API File transfer Customer</summary>
        AFT_CUSTOMER_FILEPATTERN,

        /// <summary>Fields สำหรับ API File transfer Customer</summary>
        AFT_SKUMASTERTYPE_FIELDS,
        /// <summary>Fields สำหรับ API File transfer Customer</summary>
        AFT_SKUMASTER_FIELDS,
        /// <summary>Fields สำหรับ API File transfer Customer</summary>
        AFT_SUPPLIER_FIELDS,
        /// <summary>Fields สำหรับ API File transfer Customer</summary>
        AFT_CUSTOMER_FIELDS,


        /// <summary>Require Fields สำหรับ API File transfer Customer</summary>
        AFT_SKUMasterType_RequireFields,
        /// <summary>Require Fields สำหรับ API File transfer Customer</summary>
        AFT_SKUMaster_RequireFields,
        /// <summary>Require Fields สำหรับ API File transfer Customer</summary>
        AFT_Supplier_RequireFields,
        /// <summary>Require Fields สำหรับ API File transfer Customer</summary>
        AFT_Customer_RequireFields,
        /// Path folder images 
        [EnumValueAttribute(ValueString = "PATH_FOLDER_IMAGES")]
        PATH_FOLDER_IMAGES,
        [EnumValueAttribute(ValueString = "Noti_Email_Sender")]
        Noti_Email_Sender,
        [EnumValueAttribute(ValueString = "Noti_Email_Sender_Password")]
        Noti_Email_Sender_Password,
        [EnumValueAttribute(ValueString = "Noti_Email_SMTP_Port")]
        Noti_Email_SMTP_Port,
        [EnumValueAttribute(ValueString = "Noti_Email_SMTP_Host")]
        Noti_Email_SMTP_Host,

        [EnumValueAttribute(ValueString = "TOKEN_EXPIRE_HR")]
        TOKEN_EXPIRE_HR,
        [EnumValueAttribute(ValueString = "TOKEN_EXTEND_HR")]
        TOKEN_EXTEND_HR,
    }
}
