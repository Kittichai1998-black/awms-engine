using AMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Entity
{
    public class ams_ObjectSize : BaseEntitySTD
    {
        public StorageObjectType ObjectType;
        public decimal? MinInnerWeightKG;
        public decimal? MaxInnerWeightKG;
        public decimal Volume;
        public decimal? MinInnerVolume;
        public decimal? MaxInnerVolume;
        public decimal? PercentWeightAccept;
        public bool IsDefault;
        public List<ams_ObjectSizeMap> ObjectSizeInners;
    }
}
