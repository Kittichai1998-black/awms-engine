using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Entity
{
    public class amv_PackUnitConvert : IEntityModel
    {
        public int SKUMaster_ID;
        public string SKUMaster_Code;
        public int PackMaster_ID;
        public string PackMaster_Code;
        public decimal Quantity;
        public int UnitType_ID;
        public decimal BaseQuantity;
        public int BaseUnitType_ID;
        public decimal WeightKG;
    }
}
