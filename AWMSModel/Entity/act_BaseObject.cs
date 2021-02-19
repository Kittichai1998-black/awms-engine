using AMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Entity
{
    public class act_BaseObject : BaseEntityCreateModify
    {
        public long Area_ID;
        public long Location_ID;
        //public long? McObject_ID;
        public string Code;
        public string Model;
        public string SkuCode;
        public string SkuName;
        public decimal SkuQty;
        public string SkuUnit;
        public decimal WeiKG;
        public string LabelData;
        public BaseObjectEventStatus EventStatus;
    }
}
