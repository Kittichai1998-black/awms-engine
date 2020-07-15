using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Criteria
{
    public class ConvertUnitCriteria
    {
        public long packMaster_ID;
        public string packMaster_Code;
        public long skuMaster_ID;
        public string skuMaster_Code;
        //public decimal stdWeiKg;
        public decimal oldQty;
        public long oldUnitType_ID;
        public decimal newQty;
        public long newUnitType_ID;
        public decimal baseQty;
        public long baseUnitType_ID;
        public decimal C2_Quantity;
        public long C2_UnitType_ID;
        public decimal C1_Quantity;
        public long C1_UnitType_ID;
    }
}
