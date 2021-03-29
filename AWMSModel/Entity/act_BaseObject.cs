﻿using AMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Entity
{
    public class act_BaseObject : BaseEntityCreateModify
    {
        public long Warehouse_ID;
        public long Area_ID;
        public long Location_ID;
        public long? McObject_ID;
        public string Code;
        public string Model;
        public string SkuCode;
        public string SkuName;
        public decimal SkuQty;
        public string SkuUnit;
        public string SkuStatus;
        public decimal WeiKG;
        public string Info1;
        public string Info2;
        public string Info3;
        public string LabelData;
        public string Options;
        public BaseObjectEventStatus EventStatus;
    }
}
