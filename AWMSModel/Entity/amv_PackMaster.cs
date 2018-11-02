using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Entity
{
    public class amv_PackMaster : IEntityModel
    {
        public long ID;
        public string ObjCode;
        public string PackCode;
        public long SKUMaster_ID;
        public int PackMasterType_ID;
        public string Code;
        public string Name;
        public string Description;
        public decimal? WeightKG;
        public decimal? WidthM;
        public decimal? LengthM;
        public decimal? HeightM;
        public int ItemQty;
        public long ObjectSize_ID;
        public int Revision;
        public int Status;
        public int CreateBy;
        public DateTime CreateTime;
        public int ModifyBy;
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
