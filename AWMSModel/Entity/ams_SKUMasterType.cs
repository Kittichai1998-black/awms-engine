using AWMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Entity
{
    public class ams_SKUMasterType : BaseEntitySTD
    {
        public long? UnitType_ID;
        public long? ObjectSize_ID;
        public SKUGroupType GroupType;
    }
}
