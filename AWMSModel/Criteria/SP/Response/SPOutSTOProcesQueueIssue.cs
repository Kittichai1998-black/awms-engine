using AWMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Criteria.SP.Response
{
    public class SPOutSTOProcesQueueIssue
    {
        public long id;
        public string code;
        public StorageObjectType objectType;

        public long rootID;
        public string rootCode;

        public long mstID;
        public long packID;
        public string packCode;
        public string packName;

        public decimal packQty;

        public decimal packBaseQty;
        public long packBaseUnitID;
        public string packBaseUnitCode;

        public int areaID;
        public string areaCode;
        public int? areaLocationID;
        public string areaLocationCode;
        public int warehouseID;
        public string warehouseCode;
        public int branchID;
        public string branchCode;

        public int? forCustomerID;

        public string lot;
        public string batch;
        public string orderNo;

        public DateTime? prodDate;
        public DateTime? expDate;

        public DateTime createTime;
    }
}
