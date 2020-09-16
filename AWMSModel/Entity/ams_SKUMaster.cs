using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Entity
{
    public class ams_SKUMaster : BaseEntitySTD
    {
        public decimal? WidthM;
        public decimal? LengthM;
        public decimal? HeightM;
        public long? UnitType_ID;
        public long SKUMasterType_ID;
        public decimal? Cost;
        public decimal? Price;
    }
}
