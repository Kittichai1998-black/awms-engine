using AWMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Entity
{
    public class amt_StorageObject : BaseEntityCreateModify
    {
        public long? ID;
        public int AreaLocationMaster_ID;
        public long? ParentStorageObject_ID;
        public int BaseMaster_ID;
        public int PackMaster_ID;
        public string Code;
        public StorageObjectType ObjectType;
        public decimal WeigthKG;
        public decimal WidthM;
        public decimal LengthM;
        public decimal HeightM;
        public string Options;
        public int HoleStatus;
        public int LockStatus;
        public int EventStatus;
    }
}
