using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Constant.EnumConst
{
    public enum FeatureCode
    {
        /// <summary> Mapping Pallet: ตรวจสอบสินค้าจากเอกสาร Goods Receive ถ้าพบให้สินค้าที่สแกนอ้างอิงถึงเอกสารทันที (ทำตั้งรอรับโดย ERP) </summary>
        RC0100,
        /// <summary> Mapping Pallet: ตรวจสอบจำนวนและน้ำหนัก </summary>
        RC0101,
        /// <summary> Mapping Pallet: สร้างเอกสาร Goods Received โนมัติ หลังจากยืนยันรับเข้า </summary>
        RC0102,
        /// <summary> Mapping Pallet: Close เอกสาร Goods Received โนมัติ หลังจากยืนยันรับเข้า (Request:RC0102) </summary>
        RC0103,
        /// <summary> Receive Storage: หลังจากสร้างเอกสารรับเข้าคลัง สถานะเอกสารจะเป็น </summary>
        RC0200,

    }
}
