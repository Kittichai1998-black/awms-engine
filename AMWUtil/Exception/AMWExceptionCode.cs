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
        /// <summary>ข้อมูล {0} ไม่ถูกต้อง</summary>
        [AMWExceptionDescription(TH = "ข้อมูล {0} ไม่ถูกต้อง", EN = "{0} Data Incorrect.")]
        V0001,
        /// <summary>ไม่พบข้อมูล {0} ในระบบ </summary>
        [AMWExceptionDescription(TH = "ไม่พบข้อมูล {0} ในระบบ", EN = "{0} in System Not Found.")]
        V0002,
        /// <summary>ข้อมูล {0} ที่ส่งมามีค่าว่าง</summary>
        [AMWExceptionDescription(TH = "ข้อมูล {0} ที่ส่งมามีค่าว่าง", EN = "{0} is Empty.")]
        V0003,
        /// <summary>ไม่พบ {0} ใน Master Setup</summary>
        [AMWExceptionDescription(TH = "ไม่พบ {0} ใน Master Setup", EN = "{0} in Master Setup Not Found.")]
        V0004,
        /// <summary>ไม่พบ {0} ในรายการ</summary>
        [AMWExceptionDescription(TH = "ไม่พบ {0} ในรายการ", EN = "{0} in List Not Found.")]
        V0005,
        /// <summary>{0} ในระบบมีไม่พอกับที่ต้องการ</summary>
        [AMWExceptionDescription(TH = "{0} ในระบบมีไม่พอกับที่ต้องการ", EN = "{0} in System Below")]
        V0006,



        /**********TECHNICAL*************/
        /// <summary>ไม่สามารถเชื่อมต่อฐานข้อมูลได้</summary>
        [AMWExceptionDescription(TH = "ไม่สามารถเชื่อมต่อฐานข้อมูลได้")]
        T0001,
        /// <summary>ใช้เวลาเชื่อมต่อฐานข้อมูลนานเกินไป (Timeout)</summary>
        [AMWExceptionDescription(TH = "ใช้เวลาเชื่อมต่อฐานข้อมูลนานเกินไป (Timeout)")]
        T0002,
        /// <summary>ผลลัพธ์จากการประมวลผลผิดพลาด</summary>
        [AMWExceptionDescription(TH = "ผลลัพธ์จากการประมวลผลผิดพลาด")]
        T0003,

        [AMWExceptionDescription(TH = "{0}", EN = "{0}", CN = "{0}")]
        U0000,

        /// <summary>ชื่อผู้เข้าใช้งานไม่ถูกต้อง</summary>
        [AMWExceptionDescription(TH = "ชื่อผู้เข้าใช้งานไม่ถูกต้อง")]
        O0001,
        /// <summary>ไม่มีสิทธิ์เข้าใช้งาน</summary>
        [AMWExceptionDescription(TH = "ไม่มีสิทธิ์เข้าใช้งาน")]
        O0002,

        //Login
        /// <summary>{0}</summary>
        [AMWExceptionDescription(TH = "{0}")]
        O1000,
        /// <summary>Username หรือ Password ในการเข้าระบบผิดพลาด</summary>
        [AMWExceptionDescription(TH = "Username หรือ Password ในการเข้าระบบผิดพลาด", EN = "Fail")]
        O1001,
        /// <summary>ไม่พบ Token ในระบบ กรุณา Login ใหม่</summary>
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
