using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace AMSModel.Constant.EnumConst
{
    public enum McCommandType
    {
        [DisplayAttribute(Name = "เริ่มทำงาน")]
        CM_1 = 1,
        [DisplayAttribute(Name = "SRM_กลับ Home (ด้านหน้า),CONY_เริ่มทำงานเบิก,SHU_กลับ Home ด้านหน้า")]
        CM_2 = 2,
        [DisplayAttribute(Name = "SRM_ทำงานคำสั่งล่าสุด,CONY_ทำงานคำสั่งเดิม,SHU_ทำงานคำสั่งล่าสุด")]
        CM_3 = 3,
        [DisplayAttribute(Name = "CONY_หยุดทำงาน,SHU_สลับทิศทางคำสั่งล่าสุด")]
        CM_4 = 4,
        [DisplayAttribute(Name = "CONY_ปิดการทำงานเกต,SHU_อ่านข้อมูล Pallet ID")]
        CM_5 = 5,
        [DisplayAttribute(Name = "SRM_จบงานคำสั่งปัจจุบัน,CONY_เปิดการทำงานเกต,SHU_จบงานคำสั่งปัจจุบัน")]
        CM_6 = 6,
        [DisplayAttribute(Name = "ยกเลิกคำสั่งปัจจุบัน")]
        CM_7 = 7,
        [DisplayAttribute(Name = "Reset")]
        CM_8 = 8,
        [DisplayAttribute(Name = "SRM_ยกเลิก ผิดปกติ,CONY_คอมพิวเตอร์ติดต่อส่วนกลางไม่ได้,SHU_ยกเลิก ผิดปกติ")]
        CM_9 = 9,
        [DisplayAttribute(Name = "SRM_ไปตำแหน่งต้นทาง,CONY_Eject : บาร์โค๊ดพาเลทซ้ำ,SHU_ไปตำแหน่งต้นทาง")]
        CM_10 = 10,
        [DisplayAttribute(Name = "SRM_เริ่มทำงาน (ไม่สนใจ Barcode),CONY_Eject ไม่มีข้อมูลสินค้ารับเข้า,SHU_เริ่มทำงาน (ไม่สนใจ Barcode)")]
        CM_11 = 11,
        [DisplayAttribute(Name = "SRM_กลับ Home (ด้านหลัง),CONY_Eject น้ำหนักสินค้าไม่ถูกต้อง,SHU_กลับ Home(ด้านหลัง)")]
        CM_12 = 12,
        [DisplayAttribute(Name = "SRM_เริ่มทำงาน (ปิด S/S เช็คขนาด),CONY_Eject พื้นที่จัดเก็บไม่เพียงพอ,SHU_เริ่มทำงาน (ปิด S/S เช็คขนาด)")]
        CM_13 = 13,
        [DisplayAttribute(Name = "SRM_กลับ Home ด้านหน้า (ปิด S/S เช็คขนาด),CONY_Eject จากคอมพิวเตอร์,SHU_กลับ Home ด้านหน้า (ปิด S/S เช็คขนาด)")]
        CM_14 = 14,
        [DisplayAttribute(Name = "SRM_กลับ Home ด้านหลัง (ปิด S/S เช็คขนาด),SHU_กลับ Home ด้านหลัง (ปิด S/S เช็คขนาด)")]
        CM_15 = 15,
        [DisplayAttribute(Name = "CONY_ยืนยันฟีดส่งพาเลทให้ RGV")]
        CM_20 = 20,
        [DisplayAttribute(Name = "SRM_SRM-MC_STOMOVE_SOUDES,CONY_ยืนยันฟีดส่งพาเลทให้ Lift")]
        CM_21 = 21,
        [DisplayAttribute(Name = "SRM_MC_STORECIVE_SOUDES")]   //SRM_RECIVE
        CM_22 = 22,
        [DisplayAttribute(Name = "SRM-MC_STOISSUE_SOUDES")]   //SRM_ISSUE
        CM_23 = 23,
        [DisplayAttribute(Name = "CONY_STORECIVE_SOUDES")]
        CM_32 = 32,
        [DisplayAttribute(Name = "SRM_หยุดทำงานรับพาเลทไม่ตรงตำแหน่ง,CONY_ถอยพาเลทมาที่จุดเริ่มต้น,SHU_หยุดทำงานรับพาเลทไม่ตรงตำแหน่ง")]
        CM_40 = 40,
        [DisplayAttribute(Name = "หยุดทำงานส่งพาเลทไม่ตรงตำแหน่ง")]
        CM_41 = 41,
        [DisplayAttribute(Name = "หยุดทำงาน Pallet ID. ไม่ตรงกับ Conveyor")]
        CM_42,
        [DisplayAttribute(Name = "หยุดทำงานมีการกด EM.SW. ด้านหน้า")]
        CM_50 = 50,
        [DisplayAttribute(Name = "หยุดทำงานมีการกด EM.SW. ด้านหลัง")]
        CM_51 = 51,
        [DisplayAttribute(Name = "หยุดทำงานมีการเปิดประตูรั้วด้านหน้า")]
        CM_52 = 52,
        [DisplayAttribute(Name = "หยุดทำงานมีการเปิดประตูรั้วด้านหลัง")]
        CM_53 = 53,
        [DisplayAttribute(Name = "SRM_หยุดทำงาน Request Stop (ทำงานคิวล่าสุดและจอดปกติ),SHU_เก็บพาเลทไปยังตำแหน่งกลาง Row")]
        CM_54 = 54,
        [DisplayAttribute(Name = "SRM_หยุดทำงาน Request Start (ทำงานคิวล่าสุด),SHU_เก็บพาเลทจาก ด้านหน้า")]
        CM_55 = 55,
        [DisplayAttribute(Name = "SHU_เก็บพาเลทจาก ด้านหลัง")]
        CM_56 = 56,
        [DisplayAttribute(Name = "SHU_เบิกพาเลทไปยังฝั่ง ด้านหน้า")]
        CM_57 = 57,
        [DisplayAttribute(Name = "SHU_เบิกพาเลทไปยังฝั่ง ด้านหลัง")]
        CM_58 = 58,
        [DisplayAttribute(Name = "CONY_กำหนดเป็นโหมดเก็บสินค้า,SHU_ยืนยันยก Shuttle Pallet ออกจากชั้นวางสินค้า")]
        CM_60 = 60,
        [DisplayAttribute(Name = "CONY_กำหนดเป็นโหมดเบิกสินค้า")]
        CM_61 = 61,
        [DisplayAttribute(Name = "SHU_กลับตำแหน่ง Standby ฝั่งด้านหน้า")]
        CM_62 = 62,
        [DisplayAttribute(Name = "SHU_จัดตำแหน่งพาเลทไปยังฝั่งด้านหน้า")]
        CM_63 = 63,
        [DisplayAttribute(Name = "SHU_จัดตำแหน่งพาเลทไปยังฝั่ง ด้านหลัง")]
        CM_64 = 64,
        [DisplayAttribute(Name = "SHU_Chart")]
        CM_69 = 69,
        [DisplayAttribute(Name = "SRM_ยืนยันรับส่งพาเลทกับ P/D Station")]
        CM_70 = 70,
        [DisplayAttribute(Name = "SHU_กลับตำแหน่ง Standby ฝั่ง (ด้านหลัง)")]
        CM_72 = 72,
        [DisplayAttribute(Name = "เปิดใช้งานเซ็นเซอร์เช็ควัตถุขวางทางวิ่ง")]
        CM_80 = 80,
        [DisplayAttribute(Name = "ปิดใช้งานเซ็นเซอร์เช็ควัตถุขวางทางวิ่ง")]
        CM_81 = 81,
        [DisplayAttribute(Name = "CONY_รับทราบ ยืนยันยกพาเลทออก")]
        CM_88 = 88,
        [DisplayAttribute(Name = "หยุดทำงาน")]
        CM_90 = 90,
        [DisplayAttribute(Name = "ยืนยันจบการทำงาน")]
        CM_99 = 99,
        [DisplayAttribute(Name = "CONY_รับทราบ Barcode ไม่ตรงกัน")]
        CM_116 = 116,
        [DisplayAttribute(Name = "CONY_รับทราบ ข้อมูลคำสั่ง ไม่ครบ")]
        CM_117 = 117,
        [DisplayAttribute(Name = "CONY_รับทราบ ข้อมูลคำสั่ง เกินช่วงที่กำหนด")]
        CM_118 = 118,
        [DisplayAttribute(Name = "CONY_รับทราบ มีการยกพาเลทออก")]
        CM_140 = 140,
        [DisplayAttribute(Name = "SRM_SURWAY")]
        CM_150 = 150,
        [DisplayAttribute(Name = "SRM_MOVE_SOUDES")]
        CM_151 = 151,
        [DisplayAttribute(Name = "CONY_รับทราบ Barcode ไม่ตรงกับคิวงาน")]
        CM_156 = 156,

    }
}
