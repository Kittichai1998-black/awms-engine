using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AMSModel.Constant.EnumConst
{
    public enum QueueStatus
    {
        [DisplayAttribute(Name = "เริ่มงานได้")]
        QS_1 = 1,
        [DisplayAttribute(Name = "กำลังทำงาน")]
        QS_2 = 2,
        [DisplayAttribute(Name = "Shuttle ต้องการย้ายตำแหน่ง")]
        QS_3 = 3,
        [DisplayAttribute(Name = "SRM  ย้ายเสร็จแล้ว(Step ต่อจาก 3)")]
        QS_4 = 4,
        [DisplayAttribute(Name = "คิวเบิก , คิวย้าย = Shuttle ยกของมาวางที่ Stand By แล้ว สั่ง SRM ยกของไปที่ปลายทาง , คิวเก็บ   =  สั่ง SRM ยกของไปที่ปลายทาง")]
        QS_5 = 5,
        [DisplayAttribute(Name = "คิวเบิก , คิวย้าย =  บอกให้ Shuttle รู้ว่ามีของมาวางที่ StandBy แล้ว")]
        QS_6 = 6,
        [DisplayAttribute(Name = "Reject")]
        QS_7 = 7,
        [DisplayAttribute(Name = "คิวเบิก  = SRM OutBound ยกของไปที่ปลายทางแล้ว , คิวเบิก  =  SRM OutBound ยกของไปที่ปลายทางแล้ว , คิวย้าย  = จบคิวงานย้ายแล้ว")]
        QS_9 = 9
    }
}
