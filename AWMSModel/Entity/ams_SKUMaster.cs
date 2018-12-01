using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Entity
{
    public class ams_SKUMaster : BaseEntitySTD
    {
        public decimal? WeightKG;
        public decimal? WidthM;
        public decimal? LengthM;
        public decimal? HeightM;
        public long? ObjectSize_ID;
        public long? UnitType_ID;
        public decimal? Cost;
        public decimal? Price;
    }
}
