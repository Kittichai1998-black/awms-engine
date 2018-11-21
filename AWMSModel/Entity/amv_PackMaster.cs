using AWMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Entity
{
    public class amv_PackMaster : IEntityModel
    {
        public long ID;
        public long SKUMaster_ID;
        public long PackMasterType_ID;
        public string Code;
        public string Name;
        public string ObjCode;
        public string PackCode;
        public string Description;
        public decimal WeightKG;
        public decimal WidthM;
        public decimal LengthM;
        public decimal HeightM;
        public int ItemQty;
        public long ObjectSize_ID;
        public int Revision;
        public EntityStatus Status;
        public long CreateBy;
        public DateTime CreateTime;
        public long ModifyBy;
        public DateTime ModifyTime;
        public string PackName;
        public long UnitType_ID;
        public string UnitTypeCode;
        public string UnitTypeName;
        public string ObjectSizeName;
        public string SKUCode;
        public string SKUName;
    }
}
