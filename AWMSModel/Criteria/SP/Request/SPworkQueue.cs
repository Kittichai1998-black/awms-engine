using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Criteria.SP.Request
{
    public class SPworkQueue
    {
        public int ID;
        public int IOType;
        public int Parent_WorkQueue_ID;
        public int Document_ID;
        public int DocumentItem_ID;
        public int StorageObject_ID;
        public string StorageObject_Code;
        public int Sou_Warehouse_ID;
        public int Sou_Area_ID;
        public int Sou_AreaLocation_ID;
        public int Des_Warehouse_ID;
        public int Des_Area_ID;
        public int Des_AreaLocation_ID;
        public int Priority;
        public int EventStatus;
        public int Status;
        public int TargetStartTime;
    }
}
