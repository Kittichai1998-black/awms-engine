using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Constant.EnumConst
{
    public enum WorkQueueEventStatus
    {
        IDEL = 10,//ยังไม่เริ่ม

        WORKING = 11,//กำลังทำงาน
        WORKED = 12,

        REMOVING = 21,//ยกเลิก
        REMOVED = 22,
        
        COMPLETING = 31,//เสร็จ
        COMPLETIED = 32,

        WARNING = 90,//ผิดพลาด
    }
}
