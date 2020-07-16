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
        public decimal? Quantity;
        public long? UnitType_ID;
        public decimal? BaseQuantity;
        public long? BaseUnitType_ID;
        public string Options;
        public DateTime? ProductionDate;
        public DateTime? ExpireDate;
        public string OrderNo;
        public string Batch;
        public string Lot;
        public string RefID;
        public string Ref1;
        public string Ref2;
        public string Ref3;
        public string Ref4;
        public string ItemNo;
        public DocumentEventStatus EventStatus;
        public decimal? ActualBaseQuantity;

        //public List<long> StorageObjectIDs;
        public List<amt_DocumentItemStorageObject> DocItemStos;
    }
}
