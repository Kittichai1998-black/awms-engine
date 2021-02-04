using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Entity
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
        public string Info1;
        public string Info2;
        public string Info3;
        public long? IncubationDay;
        public long? ShelfLifeDay;
        public long? ShelfLifePercent;
    }
}
