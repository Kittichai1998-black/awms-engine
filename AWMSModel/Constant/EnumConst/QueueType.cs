using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AMSModel.Constant.EnumConst
{
    public enum QueueType
    {
        [DisplayAttribute(Name = "คิวเก็บ Inbound")]
        QT_1 = 1,
        [DisplayAttribute(Name = "คิวเบิก")]
        QT_2 = 2,
        [DisplayAttribute(Name = "คิวเก็บ ฝั่ง OutBound")]
        QT_3 = 3,
        [DisplayAttribute(Name = "คิวย้ายของไป Bay ใหม่ที่ฝั่ง InBound (รองรับการเบิก Mixlot)")]
        QT_4 = 4,
        [DisplayAttribute(Name = "คิวจัดเรียง เลื่อนพาเลทไปทาง OutBound")]
        QT_5 = 5,
        [DisplayAttribute(Name = "คิวจัดเรียง เลื่อนพาเลทไปทาง Inbound")]
        QT_6 = 6,
        [DisplayAttribute(Name = "คิว Count Pallet")]
        QT_7 = 7,
        [DisplayAttribute(Name = "คิว Survey inbound เพื่อเอา Shuttle ไปหาช่องว่าง ว่าเก็บได้ไหม ")]
        QT_8 = 8,
        [DisplayAttribute(Name = "คิว Survey inbound เพื่อเอา Shuttle ไปหาช่องว่าง ว่าเก็บได้ไหม ")]
        QT_9 = 9
    }
}
