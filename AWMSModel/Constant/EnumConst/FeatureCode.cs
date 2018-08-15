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
        /// <summary> Mapping Pallet: สร้างเอกสาร Goods Received โนมัติ หลังจากยืนยันรับเข้า </summary>
        IB0102,
        /// <summary> Mapping Pallet: Close เอกสาร Goods Received โนมัติ หลังจากยืนยันรับเข้า (Request:RC0102) </summary>
        IB0103,
        /// <summary> Goods Receive to Storage: หลังจากสร้างเอกสารรับเข้าคลัง สถานะเอกสารจะเป็น </summary>
        IB0200,


        /// <summary> Goods Issued from Storage: เบิกโดยใช้ SKU ที่ Pack ต่างกันได้ </summary>
        OB0100,
        /// <summary> Goods Issuer Module Cross Dock : สร้างเอกสาร Goods Issued ได้เกินจำนวนสินค้าที่อยู่ในคลัง และ จำนวนใน Goods Receive </summary>
        OB0200,

    }
}
