using AWMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Criteria.SP.Response
{
    public class SPOutGetLastPallet
    {
        public string warehouseCode;
        public string areaCode;
        public string locationCode;
        public long id;
        public string baseCode;
        public string code;
        public decimal qty;
        public string unit;
        public decimal baseQty;
        public string baseUnit;
        public string batch;
        public string lot;
        public string orderNo;
        public DateTime? prodDate;
        public StorageObjectEventStatus eventStatus;
    }
}
