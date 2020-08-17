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
        public long? TransportObject_ID;
        public int BaseMaster_ID;
        public int PackMaster_ID;
        public int? SKUMaster_ID;
        public int? For_Customer_ID;
        public string Code;
        public string Name;
        public StorageObjectType ObjectType;
        public decimal WeigthKG;
        public decimal WidthM;
        public decimal LengthM;
        public decimal HeightM;
        public string Options;
        public string RefID;
        public string Ref1;
        public string Ref2;
        public string Ref3;
        public string Ref4;
        public int IsHold;
        public AuditStatus AuditStatus;
        public int IsStock;
        public StorageObjectEventStatus EventStatus;
        public long BaseUnitType_ID;
        public long UnitType_ID;
        public decimal Quantity;
        public decimal BaseQuantity;
        public string Batch;
        public string Lot;
        public string OrderNo;
        public string CartonNo;
        public string ItemNo;
        public DateTime? ProductDate;
        public DateTime? ExpiryDate;
        public DateTime? ShelfLiftDate;
        public DateTime? IncubationDate;

    }
}
