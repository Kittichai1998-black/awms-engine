using AWMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Entity
{
    public class ams_ObjectSize : BaseEntitySTD
    {
        public StorageObjectType ObjectType;
        public decimal? MinWeigthKG;
        public decimal? MaxWeigthKG;
        public bool IsDefault;
        public decimal? PercentWeightAccept;
        public List<ams_ObjectSizeMap> ObjectSizeInners;
    }
}
