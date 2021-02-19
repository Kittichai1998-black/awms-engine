using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Entity
{
    public class amt_WorkQueueDocumentItem : BaseEntityCreateModify
    {
        public long DocumentItem_ID;
        public long WorkQueue_ID;
        public decimal Quantity;
        public decimal BaseQuantity;
        public long UnitType_ID;
        public long BaseUnitType_ID;
    }
}
