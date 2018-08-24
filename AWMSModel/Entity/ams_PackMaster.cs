using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Entity
{
    public class ams_PackMaster : BaseEntitySTD
    {
        public int SKUMaster_ID;
        public int PackMasterType_ID;
        public decimal? WeightKG;
        public decimal? WidthM;
        public decimal? LengthM;
        public decimal? HeightM;
        public decimal ItemQty;
        public int ObjectSize_ID;
        public int Revision;
    }
}
