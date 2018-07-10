using AWMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Criteria.SP.Response
{
    public class SPStorageObjectCriteria
    {
        public int? id;
        public StorageObjectChildType type;
        public int? parentID;
        public StorageObjectChildType? parentType;
        public string code;
        public string name;
        public decimal? minChildWeiKG;
        public decimal? maxChildWeiKG;
        public decimal? minChildQty;
        public decimal? maxChildQty;
        public string options;
        
    }
}
