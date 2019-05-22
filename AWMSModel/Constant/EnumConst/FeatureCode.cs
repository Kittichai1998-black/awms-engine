using AMWUtil.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Constant.EnumConst
{
    public enum FeatureCode
    {
        /// <summary> Mapping Pallet: ตรวจสอบสินค้าจากเอกสาร Goods Receive ถ้าพบให้สินค้าที่สแกนอ้างอิงถึงเอกสารทันที (ทำตั้งรอรับโดย ERP) </summary>
        IB0100,
        /// <summary> Mapping Pallet: ตรวจสอบจำนวนและน้ำหนัก </summary>
        IB0101,
        /// <summary> Mapping Pallet: สร้างเอกสาร Goods Received โนมัติ หลังจากยืนยันรับเข้า (IB0100:INACTIVE)</summary>
        IB0102,
        /// <summary> Mapping Pallet: Close เอกสาร Goods Received โนมัติ หลังจากยืนยันรับเข้า (IB0100:ACTIVE or IB0102:ACTIVE) </summary>
        IB0103,

        /// <summary> Mapping Pallet: Pack into Base - Use Multi SKU </summary>
        IB0104,

        /// <summary> ASRS Validate Weight </summary>
        IB0201,

        /// <summary> Goods Issued from Storage: เบิกโดยใช้ SKU ที่ Pack ต่างกันได้ </summary>
        //OB0100,
        /// <summary> Goods Issuer Module Cross Dock : สร้างเอกสาร Goods Issued ได้เกินจำนวนสินค้าที่อยู่ในคลัง และ จำนวนใน Goods Receive </summary>
        OB0200,

        /// <summary> Close Document : ตรวจสอบการส่งข้อมูลการปิดเอกสาร Goods Received ไปที่ระบบ ERP </summary>
        SendERPAPIOnClosed_1001_1,

        /// <summary> Close Document : ตรวจสอบการส่งข้อมูลการปิดเอกสาร Goods Issued ไปที่ระบบ ERP </summary>
        SendERPAPIOnClosed_1002_1,

        /// <summary> Close Document : ตรวจสอบข้อมูลก่อนสร้างเอกสาร </summary>
        BEFCreateDoc_1001_101,

        /// <summary> Close Document : ตรวจสอบข้อมูลหลังสร้างเอกสาร </summary>
        AFTCreateDoc_1001_101,

        [EnumValueAttribute(ValueString = "WCEB01")]
        EXEWM_CreateGRDocument_Exec_Before,

        [EnumValueAttribute(ValueString = "PRGS01")]
        EXEPJ_RegisterWorkQueue_GetSTO,

        [EnumValueAttribute(ValueString = "PRGD01")]
        EXEPJ_RegisterWorkQueue_GetDocumentItemAndDISTO,

        [EnumValueAttribute(ValueString = "PRGL01")]
        EXEPJ_RegisterWorkQueue_GetDesLocations,

        [EnumValueAttribute(ValueString = "DQUW01")]
        EXEWM_DoneQueueWorked,

        [EnumValueAttribute(ValueString = "DQUC01")]
        EXEWM_DoneQueueClosing,

        [EnumValueAttribute(ValueString = "DQUC02")]
        EXEWM_DoneQueueClosed,

         /// <summary> Close Document GI : ตรวจสอบข้อมูลก่อนสร้างเอกสาร </summary>
        BEFCreateDoc_1002_102,

        /// <summary> Close Document GI : ตรวจสอบข้อมูลหลังสร้างเอกสาร </summary>
        AFTCreateDoc_1002_102,
    }
}
