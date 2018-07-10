using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Entity
{
    public class ams_PackMaster : BaseEntitySTD
    {
        int SKU_ID;
        int PackType_ID;
        decimal? WeightKG;
        decimal? WidthM;
        decimal? LengthM;
        decimal? HeightM;
        decimal ItemQty;
        int Revision;
    }
}
