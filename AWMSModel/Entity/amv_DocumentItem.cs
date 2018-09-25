using AWMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Entity
{
    public class amv_DocumentItem : IEntityModel
    {
        public long? ID;
        public long? Document_ID;
        public long? SKUMaster_ID;
        public long? PackMaster_ID;
        public string Code;
        public int Quantity;
        public string Options;
        public DateTime? ProductionDate;
        public DateTime? ExpireDate;
        public string Ref1;
        public string Ref2;
        public string Ref3;
        public DocumentEventStatus EventStatus;
        public EntityStatus Status;
        public long CreateBy;
        public DateTime CreateTime;
        public long? ModifyBy;
        public DateTime ModifyTime;
        public string Document_Code;
        public string SKUMaster_Code;
        public string SKUMaster_Name;
        public string PackMaster_Code;
        public string PackMaster_Name;
        public long? UnitType_ID;
        public string UnitType_Code;
        public string UnitType_Name;
    }
}
