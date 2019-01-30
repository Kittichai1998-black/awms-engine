using AWMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Criteria.SP.Response
{
    public class SPOutDocItemCanMap
    {
        public long Document_ID;
        public string DocumentCode;
        public long DocumentItem_ID;
        public string DocumentItemCode;
        public long StorageObject_ID;
        public EntityStatus Status;
        public long DocumentType_ID;
        public long PackMaster_ID;
        public string PackMaster_Code;
        public string Batch;
        public string Lot;
        public int NeedQty;
        public int MaxQty;
    }
}
