using AMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Entity
{
    public class amv_LinkDocument : IEntityModel
    {
        public long? ID;
        public string Code;
        public string DesBranchName;
        public string Created;
        public string Batch;
        public string DesWarehouseName;
        public string SouWarehouseName;
        public DateTime? ActionTime;
        public string SouBranchName;
        public EntityStatus Status;
        public string Ref2;
        public string Ref1;
        public string RefID;
        public DocumentEventStatus EventStatus;
        public DateTime DocumentDate;
        public long? DocumentType_ID;
        public string Super;
        public long SuperID;
       
    }
}
