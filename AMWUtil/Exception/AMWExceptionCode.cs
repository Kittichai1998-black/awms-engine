using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AMWUtil.Exception
{
    public enum AMWExceptionCode
    {
        /*********SUCCESS***********/
        [AMWExceptionDescription("I0000", DefaultMessage = "สำเร็จ")]
        I0000,
        [AMWExceptionDescription("I0001", DefaultMessage = "ไม่สำเร็จ")]
        I0001,

        /******VALIDATE*******/
        /// <summary>Validate Request Model</summary>
        [AMWExceptionDescription("V0000", DefaultMessage = "ไม่ผ่าน validate. เนื่องจากไม่ส่ง field '{0}'")]
        V0_VALIDATE_REQUIRE_FAIL,
        [AMWExceptionDescription("V0001", DefaultMessage = "ไม่ผ่าน validate. เนื่องจาก field '{0}' มีค่า '{1}' ไม่ตรงรุปแบบ '{2}'")]
        V0_VALIDATE_REGEX_FAIL,
        [AMWExceptionDescription("V0002", DefaultMessage = "ไม่ผ่าน validate. เนื่องจาก method '{0}' ไม่ยอมรับ field '{0}' ที่มีค่า '{1}'")]
        V0_VALIDATE_METHOD_FAIL,

        [AMWExceptionDescription("V0100", DefaultMessage = "ไม่สามารถ validate ได้. เนื่องจาก model ที่ใช้ validate มีค่าเป็น null")]
        V0_MODEL_IS_NULL,
        [AMWExceptionDescription("V0101", DefaultMessage = "method '{0}' ไม่ใช่ static")]
        V0_METHOD_NOT_STATIC,
        [AMWExceptionDescription("V0102", DefaultMessage = "parameter ใน method '{0}' ต้องมีเพียง 1 argument เท่านั้น")]
        V0_METHOD_PARAMETER_1ARG_ONLY,
        [AMWExceptionDescription("V0103", DefaultMessage = "parameter type ใน method '{0}' ไม่ตรงกับ field ที่นำมา validate")]
        V0_METHOD_PARAMETER_TYPE_NOT_EQ,




        /// <summary>Data Input Not Found : {0}</summary>
        [AMWExceptionDescription("V1001", DefaultMessage = "{0}")]
        V1001,
        /// <summary>Invalid Data Input : {0}</summary>
        [AMWExceptionDescription("V1002", DefaultMessage = "{0}")]
        V1002,

        /// <summary>Data System Not Found : {0}</summary>
        [AMWExceptionDescription("V2001", DefaultMessage = "{0}")]
        V2001,
        /// <summary>Invalid Data System : {0}</summary>
        [AMWExceptionDescription("V2002", DefaultMessage = "{0}")]
        V2002,

        /// <summary>Data Output Not Found : {0}</summary>
        [AMWExceptionDescription("V3001", DefaultMessage = "{0}")]
        V3001,
        /// <summary>Invalid Data Output : {0}</summary>
        [AMWExceptionDescription("V3002", DefaultMessage = "{0}")]
        V3002,

        /// <summary>Condition Error : {0}</summary>
        [AMWExceptionDescription("B0001", DefaultMessage = "{0}")]
        B0001,
        /// <summary>{0} Not enough</summary>
        [AMWExceptionDescription("B0002", DefaultMessage = "{0}")]
        B0002,

        /// <summary>System Error : {0}</summary>
        [AMWExceptionDescription("S0001", DefaultMessage = "{0}")]
        S0001,
        /// <summary>Connection Error : {0}</summary>
        [AMWExceptionDescription("S0002", DefaultMessage = "{0}")]
        S0002,
        /// <summary>Time Out : {0}</summary>
        [AMWExceptionDescription("S0003", DefaultMessage = "{0}")]
        S0003,
        /// <summary>SQLDatabase Deadlock : {0}</summary>
        [AMWExceptionDescription("S0004", DefaultMessage = "{0}")]
        S0004,


        /// <summary>Authentication Error</summary>
        [AMWExceptionDescription("A0001", DefaultMessage = "{0}")]
        A0001,
        /// <summary>Authorization Error</summary>
        [AMWExceptionDescription("A0002", DefaultMessage = "{0}")]
        A0002,
        /// <summary>Token Error : {0}</summary>
        [AMWExceptionDescription("A0003", DefaultMessage = "{0}")]
        A0003,


        [AMWExceptionDescription("U0000", DefaultMessage = "UKNOW : {0}")]
        U0000,
    }
}
