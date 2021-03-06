using AMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Entity
{
    public class amt_WorkQueue : BaseEntityCreateModify
    {
        public int Seq;
        public IOType IOType;
        //public long? Parent_WorkQueue_ID;
        //public long? Document_ID;
        //public long? DocumentItem_ID;
        public long StorageObject_ID;
        public string StorageObject_Code;
        public long Sou_Warehouse_ID;
        public long Sou_Area_ID;
        public long? Sou_AreaLocation_ID;
        public long Des_Warehouse_ID;
        public long Des_Area_ID;
        public long? Des_AreaLocation_ID;

        public long Warehouse_ID;
        public long Area_ID;
        public long? AreaLocation_ID;

        public DateTime? StartTime;
        public DateTime? EndTime;
        public DateTime? ActualTime;
        public int Priority;
        public string RefID;
        public WorkQueueEventStatus EventStatus;
    }
}
