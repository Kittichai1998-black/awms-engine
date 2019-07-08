using AWMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Entity
{
    public class amt_StorageObject : BaseEntityCreateModify
    {
        public int? AreaMaster_ID;
        public int? AreaLocationMaster_ID;
        public long? ParentStorageObject_ID;
        public int BaseMaster_ID;
        public int PackMaster_ID;
        public string Code;
        public string Name;
        public StorageObjectType ObjectType;
        public decimal WeigthKG;
        public decimal WidthM;
        public decimal LengthM;
        public decimal HeightM;
        public string Options;
        public int HoleStatus;
        public int LockStatus;
        public StorageObjectEventStatus EventStatus;
        public string Batch;
        public string Lot;
        public string OrderNo;
        public long BaseUnitType_ID;
        public long UnitType_ID;
        public decimal Quantity;
        public decimal BaseQuantity;
        public DateTime? ProductDate;

    }
}
