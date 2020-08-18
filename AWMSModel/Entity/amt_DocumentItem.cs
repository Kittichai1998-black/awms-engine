using AWMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Entity
{
    public class amt_DocumentItem : Entity.BaseEntityCreateModify
    {
        public long Document_ID;
        public long? ParentDocumentItem_ID;
        public string Code;
        public long? SKUMaster_ID;
        public long? PackMaster_ID;
        public string ItemNo;
        public string BaseCode;
        public string LocationCode;
        public decimal? Quantity;
        public long? UnitType_ID;
        public decimal? BaseQuantity;
        public long? BaseUnitType_ID;
        public string Options;
        public DateTime? ProductionDate;
        public DateTime? ExpireDate;
        public long? ShelfLifeDay;
        public long? IncubationDay;
        public string OrderNo;
        public string CartonNo;
        public string Batch;
        public string Lot;
        public string RefID;
        public string Ref1;
        public string Ref2;
        public string Ref3;
        public string Ref4;
        public AuditStatus AuditStatus;
        public DocumentEventStatus EventStatus;
        public decimal? ActualBaseQuantity;

        //public List<long> StorageObjectIDs;
        public List<amt_DocumentItemStorageObject> DocItemStos;
    }
}
