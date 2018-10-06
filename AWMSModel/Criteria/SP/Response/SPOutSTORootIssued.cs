﻿using AWMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Criteria.SP.Response
{
    public class SPOutSTORootIssued
    {
        public long id;
        public string code;
        public StorageObjectType objectType;
        public long rootID;
        public string rootCode;

        public int areaID;
        public string areaCode;
        public int? areaLocationID;
        public string areaLocationCode;
        public int warehouseID;
        public string warehouseCode;
        public int branchID;
        public string branchCode;

        public int? forCustomerID;
        public int packQty;
        public DateTime? prodDate;
        public DateTime? expDate;
        public DateTime creatTime;
        
    }
}