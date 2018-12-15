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
        public DateTime? StartTime;
        public DateTime? EndTime;
        public EntityStatus Status;

        public List<amt_WorkQueueDocumentItem> DocumentItemWorkQueues;

        public static SPworkQueue Generate(amt_WorkQueue queue)
        {
            var res = new SPworkQueue()
            {
                ID = queue.ID,
                IOType = queue.IOType,
                Parent_WorkQueue_ID = queue.Parent_WorkQueue_ID,
                StorageObject_ID = queue.StorageObject_ID,
                StorageObject_Code = queue.StorageObject_Code,
                Sou_Warehouse_ID = queue.Sou_Warehouse_ID,
                Sou_AreaMaster_ID = queue.Sou_Area_ID,
                Sou_AreaLocationMaster_ID = queue.Sou_AreaLocation_ID,
                Des_Warehouse_ID = queue.Des_Warehouse_ID,
                Des_AreaMaster_ID = queue.Des_Area_ID,
                Des_AreaLocationMaster_ID = queue.Des_AreaLocation_ID,
                Priority = queue.Priority,

                EventStatus = queue.EventStatus,
                Status = queue.Status,
                Warehouse_ID = queue.Warehouse_ID,
                AreaMaster_ID = queue.Area_ID,
                AreaLocationMaster_ID = queue.AreaLocation_ID,
                ActualTime = queue.ActualTime,
                EndTime = queue.EndTime,
                Seq = queue.Seq,
                RefID = queue.RefID,
                StartTime = queue.StartTime,
                TargetStartTime = queue.TargetStartTime,
                DocumentItemWorkQueues = null,
            };
            return res;
        }
    }
}
