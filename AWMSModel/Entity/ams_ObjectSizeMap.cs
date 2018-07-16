using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Entity
{
    public class ams_ObjectSizeMap : BaseEntitySTD
    {
        public int OuterObjectSize_ID;
        public int InnerObjectSize_ID;
        public int? MinQuantity;
        public int? MaxQuantity;
    }
}
