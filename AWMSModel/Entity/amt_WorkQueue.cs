using AWMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Entity
{
    public class amt_WorkQueue : BaseEntityCreateModify
    {
        public int Seq;
        public IOType IOType;
        public long? Parent_WorkQueue_ID;
        public long? Document_ID;
        public long? DocumentItem_ID;
        public long StorageObject_ID;
        public string StorageObject_Code;
        public int Sou_Warehouse_ID;
        public int Sou_Area_ID;
        public int? Sou_AreaLocation_ID;
        public int Des_Warehouse_ID;
        public int Des_Area_ID;
        public int? Des_AreaLocation_ID;
        public int Priority;
        public string RefID;
        public WorkQueueEventStatus EventStatus;
    }
}
