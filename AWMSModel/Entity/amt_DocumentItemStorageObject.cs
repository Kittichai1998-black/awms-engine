using AWMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Entity
{
    public class amt_DocumentItemStorageObject : BaseEntityID
    {
        public long DocumentItem_ID;
        public long? WorkQueue_ID;
        public long Sou_StorageObject_ID;
        public long? Des_StorageObject_ID;
        public decimal? Quantity;
        public decimal? BaseQuantity;
        public long UnitType_ID;
        public long BaseUnitType_ID;
        public EntityStatus Status;
    }
}
