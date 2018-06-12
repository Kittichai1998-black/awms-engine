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
        [AMWExceptionDescription(TH = "สำเร็จ" , EN = "Success")]
        S0000,
        [AMWExceptionDescription(TH = "ไม่สำเร็จ", EN = "Fail")]
        S0001,

        /******VALIDATE*******/
        [AMWExceptionDescription(TH = "{0}")]
        V0000,
        /// <summary>ข้อมูล {0} ไม่ถูกต้อง</summary>
        [AMWExceptionDescription(TH = "ข้อมูล {0} ไม่ถูกต้อง", EN = "{0} data incorrect.")]
        V0001,
        /// <summary>ไม่พบข้อมูล {0}</summary>
        [AMWExceptionDescription(TH = "ไม่พบ {0}", EN = "{0} Not Found.")]
        V0002,



        /**********TECHNICAL*************/
        [AMWExceptionDescription(TH = "ไม่สามารถเชื่อมต่อฐานข้อมูลได้")]
        T0001,
        [AMWExceptionDescription(TH = "ใช้เวลาเชื่อมต่อฐานข้อมูลนานเกินไป (Timeout)")]
        T0002,

        [AMWExceptionDescription(TH = "{0}", EN = "{0}", CN = "{0}")]
        U0000,

        // oauth
        [AMWExceptionDescription(TH = "{0}")]
        O0000,
        
        // for relogin
        [AMWExceptionDescription(TH = "{0}")]
        O1000,
        [AMWExceptionDescription(TH = "Username หรือ Password ในการเข้าระบบผิดพลาด", EN = "Fail")]
        O1001,
        [AMWExceptionDescription(TH = "ไม่พบ Token ในระบบ กรุณา Login ใหม่", EN = "Fail")]
        O1002,

        // for renew
        [AMWExceptionDescription(TH = "{0}")]
        O9000,
        [AMWExceptionDescription(TH = "Token นี้ไม่สามารถใช้งานได้", EN = "Fail")]
        O9001,
        [AMWExceptionDescription(TH = "ยืนยัน Password สำหรับต่ออายุ Token ผิดพลาด", EN = "Fail")]
        O9002

    }
}
