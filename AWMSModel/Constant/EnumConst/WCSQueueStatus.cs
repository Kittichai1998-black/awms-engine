using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Constant.EnumConst
{
    public enum WCSQueueStatus
    {
        QUEUE_NEW = 0,//มี Queue แต่ยังไม่ทำงาน
        QUEUE_WORKING = 1,//มี Queue กำลังทำงานอยู่
        QUEUE_DONE =2,//มี Queue และจบงานแล้ว
        QUEUE_REJECT = 3,//มี Queue แต่ยกเลิกไปแล้ว
        QUEUE_NONE = 4 // ไม่มี Queue ในระบบ

    }
}
