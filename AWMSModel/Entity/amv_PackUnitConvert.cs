using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Entity
{
    public class amv_PackUnitConvert : IEntityModel
    {
        public int SKUMaster_ID;
        public string SKUMaster_Code;
        public long SKUMaster_UnitType_ID;


        public long? C1_PackMaster_ID;
        public string C1_PackMaster_Code;
        public decimal C1_Quantity;
        public long C1_UnitType_ID;
        public long? C2_PackMaster_ID;
        public string C2_PackMaster_Code;
        public decimal C2_Quantity;
        public long C2_UnitType_ID;
    }
}
