using AMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Criteria.SP.Request
{
    public class SPInSTOSearchCriteria
    {
        public long? stoID;
        public int? objectType;
        public int? holdStatus;
        public int? eventStatus;
        public int? status;
        public DateTime? productDate;
        public DateTime? expireDate;
        public string batch;
        public string lot;
        public string rootBaseCode;
        public string rootBaseTypeCode;
        public string rootBaseTypeName;
        public string skuCode;
        public string skuName;
        public string packCode;
        public string packName;
        public string branchCode;
        public string branchName;
        public string warehouseCode;
        public string warehouseName;
        public string areaCode;
        public string areaName;
        public string customerCode;
        public string customerName;
        public string locationCode;

        public string s_f;
        public string s_od;
        public int sk;
        public int l;
    }
}
