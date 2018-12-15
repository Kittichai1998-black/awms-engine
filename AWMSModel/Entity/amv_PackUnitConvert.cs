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
        public int BaseUnitType_ID;
        public int UnitType_ID;
        public decimal ItemQty;
    }
}
