using AWMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Criteria.SP.Response
{
    public class SPOutSTOMiniCriteria
    {
        public int? id;
        public StorageObjectType type;
        public int? mstID;
        public int? parentID;
        public StorageObjectType? parentType;
        public string code;
        public string name;
        public int warehouseID;
        public int areaID;
        public decimal? weiKG;
        public int? objectSizeID;
        public string lot;
        public string batch;
        public StorageObjectEventStatus eventStatus;
        //public int? sizeLevel;
        //public string innerSizeLevels;
        public string options;
        
    }
}
