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
        public int? parentID;
        public StorageObjectType? parentType;
        public string code;
        public string name;
        public decimal? minChildWeiKG;
        public decimal? maxChildWeiKG;
        public decimal? minChildQty;
        public decimal? maxChildQty;
        public int? sizeLevel;
        public string innerSizeLevels;
        public string options;
        
    }
}
