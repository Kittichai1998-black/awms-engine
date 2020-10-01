using AWMSModel.Constant.EnumConst;
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
        public StorageObjectEventStatus rstoEventStatus;

        public long bstoID;
        public string bstoCode;
        public StorageObjectEventStatus bstoEventStatus;

        public long pstoID;
        public string pstoCode;
        public string pstoName;
        public long? pstoParentID;
        public long? pstoForCusID;
        public long SKUMasterID;
        public string pstoBatch;
        public string pstoLot;
        public string pstoOrderNo;
        public string pstoOptions;
        public StorageObjectEventStatus pstoEventStatus;

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

        public bool useFullPick;
        public DateTime? pstoExpiryDate;
        public DateTime? pstoProductDate;
        public DateTime pstoCreateTime;

        public string pstoRefID;
        public string pstoRef1;
        public string pstoRef2;
        public string pstoRef3;
        public string pstoRef4;

        public bool isWCSReady = true;
    }
}
