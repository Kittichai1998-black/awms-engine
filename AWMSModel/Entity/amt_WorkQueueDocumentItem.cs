using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Entity
{
    public class amt_WorkQueueDocumentItem : BaseEntityID
    {
        public long DocumentItem_ID;
        public long WorkQueue_ID;
        public decimal Quantity;
        public decimal BaseQuantity;
        public long UnitType_ID;
        public long BaseUnitType_ID;
    }
}
