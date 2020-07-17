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
        [AMWExceptionCodeAttribute("I0000", DefaultMessage = "สำเร็จ")]
        I0000,
        [AMWExceptionCodeAttribute("I0001", DefaultMessage = "ไม่สำเร็จ")]
        I0001,

        /******VALIDATE*******/
        /// <summary>Validate Request Model</summary>
        [AMWExceptionCodeAttribute("V0000", DefaultMessage = "ไม่ผ่าน validate. เนื่องจากไม่ส่ง field '{1}'")]
        V0_VALIDATE_REQUIRE_FAIL,
        [AMWExceptionCodeAttribute("V0001", DefaultMessage = "ไม่ผ่าน validate. เนื่องจาก field '{1}' มีค่า '{2}' ไม่ตรงรุปแบบ '{0}'")]
        V0_VALIDATE_REGEX_FAIL,
        [AMWExceptionCodeAttribute("V0002", DefaultMessage = "ไม่ผ่าน validate. เนื่องจาก method '{0}' ไม่ยอมรับ field '{1}' ที่มีค่า '{2}'")]
        V0_VALIDATE_METHOD_FAIL,

        [AMWExceptionCodeAttribute("V0100", DefaultMessage = "ไม่สามารถ validate ได้. เนื่องจาก model ที่ใช้ validate มีค่าเป็น null")]
        V0_MODEL_IS_NULL,
        [AMWExceptionCodeAttribute("V0101", DefaultMessage = "method '{0}' ไม่ใช่ static")]
        V0_METHOD_NOT_STATIC,
        [AMWExceptionCodeAttribute("V0102", DefaultMessage = "parameter ใน method '{0}' ต้องมีเพียง 1 argument เท่านั้น")]
        V0_METHOD_PARAMETER_1ARG_ONLY,
        [AMWExceptionCodeAttribute("V0103", DefaultMessage = "parameter type ใน method '{0}' ไม่ตรงกับ field ที่นำมา validate")]
        V0_METHOD_PARAMETER_TYPE_NOT_EQ,




        /// <summary>Data Input Not Found : {0}</summary>
        [AMWExceptionCodeAttribute("V1001", DefaultMessage = "{0}")]
        V1001,
        /// <summary>Invalid Data Input : {0}</summary>
        [AMWExceptionCodeAttribute("V1002", DefaultMessage = "{0}")]
        V1002,

        /// <summary>Data System Not Found : {0}</summary>
        [AMWExceptionCodeAttribute("V2001", DefaultMessage = "{0}")]
        V2001,
        /// <summary>Invalid Data System : {0}</summary>
        [AMWExceptionCodeAttribute("V2002", DefaultMessage = "{0}")]
        V2002,

        /// <summary>Data Output Not Found : {0}</summary>
        [AMWExceptionCodeAttribute("V3001", DefaultMessage = "{0}")]
        V3001,
        /// <summary>Invalid Data Output : {0}</summary>
        [AMWExceptionCodeAttribute("V3002", DefaultMessage = "{0}")]
        V3002,

        /// <summary>Condition Error : {0}</summary>
        [AMWExceptionCodeAttribute("B0001", DefaultMessage = "{0}")]
        B0001,
        /// <summary>{0} Not enough</summary>
        [AMWExceptionCodeAttribute("B0002", DefaultMessage = "{0}")]
        B0002,

        /// <summary>System Error : {0}</summary>
        [AMWExceptionCodeAttribute("S0001", DefaultMessage = "{0}")]
        S0001,
        /// <summary>Connection Error : {0}</summary>
        [AMWExceptionCodeAttribute("S0002", DefaultMessage = "{0}")]
        S0002,
        /// <summary>Time Out : {0}</summary>
        [AMWExceptionCodeAttribute("S0003", DefaultMessage = "{0}")]
        S0003,
        /// <summary>SQLDatabase Deadlock : {0}</summary>
        [AMWExceptionCodeAttribute("S0004", DefaultMessage = "{0}")]
        S0004,


        /// <summary>Username หรือ Password ไม่ถูกต้อง</summary>
        [AMWExceptionCodeAttribute("A0010", DefaultMessage = "Username หรือ Password ไม่ถูกต้อง")]
        A0010,
        /// <summary>SecretKey ไม่ถูกต้อง</summary>
        [AMWExceptionCodeAttribute("A0011", DefaultMessage = "SecretKey ไม่ถูกต้อง")]
        A0011,
        /// <summary>Token หมดอายุ</summary>
        [AMWExceptionCodeAttribute("A0012", DefaultMessage = "Token หมดอายุ")]
        A0012,
        /// <summary>Token ไม่ถูกต้อง</summary>
        [AMWExceptionCodeAttribute("A0013", DefaultMessage = "Token ไม่ถูกต้อง")]
        A0013,
        /// <summary>ไม่สามารถ Login ผ่าน LDAP ได้</summary>
        [AMWExceptionCodeAttribute("A0010", DefaultMessage = "Username หรือ Password ไม่ถูกต้อง")]
        A0014,


        [AMWExceptionCodeAttribute("U0000", DefaultMessage = "UKNOW : {0}")]
        U0000,
    }
}
