using AWMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Criteria.SP.Response
{
    public class SPOutSTORootCanUseCriteria
    {
        public long id;
        public string code;
        public string name;
        public StorageObjectType objectType;
        public long rootID;
        public string rootCode;
        public string rootName;

        public long mstID;
        public long packID;
        public long packUnitID;
        public string packCode;
        public string packName;
        public string packUnitCode;

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
