using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Criteria.SP.Response
{
    public class SPOutSTOProcessQueueCriteria
    {
        public long warehouseID;
        public string warehouseCode;
        public long areaID;
        public string areaCode;
        public long? locationID;
        public string locationCode;

        public long rstoID;
        public string rstoCode;

        public long bstoID;
        public string bstoCode;

        public long pstoID;
        public string pstoCode;
        public string pstoName;
        public long? pstoParentID;
        public long? pstoForCusID;
        public string pstoBatch;
        public string pstoLot;
        public string pstoOrderNo;
        public string pstoOptions;

        //public decimal totalBaseQty;
        //public decimal conditionBaseQty;
        public decimal pickBaseQty;
        public decimal pstoBaseQty;
        public long pstoBaseUnitID;
        public string pstoBaseUnitCode;

        public decimal pickQty;
        public decimal pstoQty;
        public long pstoUnitID;
        public string pstoUnitCode;

        public DateTime? pstoExpiryDate;
        public DateTime? pstoProductDate;
        public DateTime pstoCreateTime;

        public bool isWCSReady = true;
    }
}
