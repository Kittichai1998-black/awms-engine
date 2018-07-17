using AWMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Criteria.SP.Response
{
    public class SPStorageObjectCriteria
    {
        public int? id;
        public StorageObjectType type;
        public int? mstID;
        public int? parentID;
        public StorageObjectType? parentType;
        public string code;
        public string name;
        public decimal? weiKG;
        public int? objectSizeID;
        public StorageObjectEventStatus eventStatus;
        //public int? sizeLevel;
        //public string innerSizeLevels;
        public string options;
        
    }
}
