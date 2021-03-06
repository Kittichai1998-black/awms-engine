using AMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Entity
{
    public class amt_DocumentItemStorageObject : BaseEntityCreateModify
    {
        public bool IsLastSeq;
        public long? DocumentItem_ID;
        public DocumentTypeID? DocumentType_ID;
        public long? WorkQueue_ID;
        public long Sou_StorageObject_ID;
        public long? Sou_WaveSeq_ID;
        public long? Des_StorageObject_ID;
        public long? Des_WaveSeq_ID;
        public decimal? Quantity;
        public decimal? BaseQuantity;
        public long UnitType_ID;
        public long BaseUnitType_ID;
    }
}
