using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria.SP.Response;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Criteria.SP.Request
{
    public class SPworkQueue
    {
        public long? ID;
        public IOType IOType;
        public int Seq;
        public string RefID;
        public long? Parent_WorkQueue_ID;
        public long? Document_ID;
        public long? DocumentItem_ID;
        public long? StorageObject_ID;
        public string StorageObject_Code;

        public long Sou_Warehouse_ID;
        public long Sou_AreaMaster_ID;
        public long? Sou_AreaLocationMaster_ID;

        public long Des_Warehouse_ID;
        public long Des_AreaMaster_ID;
        public long? Des_AreaLocationMaster_ID;

        public long Warehouse_ID;
        public long AreaMaster_ID;
        public long? AreaLocationMaster_ID;

        public int Priority;
        public WorkQueueEventStatus EventStatus;
        public DateTime? TargetStartTime;
        public DateTime? ActualTime;
        public EntityStatus Status;

    }
}
