using AWMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Criteria.SP.Response
{
    public class SPOutSTORootCanUseCriteria
    {
        public long sou_id;
        public StorageObjectType sou_objectType;

        public long sou_mstID;
        public long sou_packID;
        public string sou_packCode;
        public string sou_packName;

        public decimal sou_packQty;
        public long sou_packUnitID;
        public string sou_packUnitCode;

        public decimal sou_packBaseQty;
        public long sou_packBaseUnitID;
        public string sou_packBaseUnitCode;

        public int? sou_forCustomerID;
        public DateTime? sou_prodDate;
        public DateTime? sou_expDate;

        public string sou_batch;
        public string sou_lot;
        public string sou_orderNo;

        public EntityStatus sou_status;

        public long des_id;
        public StorageObjectType des_objectType;

        public long des_mstID;
        public long des_packID;
        public string des_packCode;
        public string des_packName;

        public decimal des_packQty;
        public long des_packUnitID;
        public string des_packUnitCode;

        public decimal des_packBaseQty;
        public long des_packBaseUnitID;
        public string des_packBaseUnitCode;

        public int? des_forCustomerID;
        public DateTime? des_prodDate;
        public DateTime? des_expDate;

        public string des_batch;
        public string des_lot;
        public string des_orderNo;

        public EntityStatus des_status;

        public long docItemID;
        public string code;
        public string name;

        public long rootID;
        public string rootCode;
        public string rootName;

        public decimal distoQty;
        public decimal distoQtyMax;
        public long distoUnitID;
        public string distoUnitCode;

        public decimal distoBaseQty;
        public decimal distoBaseQtyMax;
        public long distoBaseUnitID;
        public string distoBaseUnitCode;

        public int areaID;
        public string areaCode;
        public int? areaLocationID;
        public string areaLocationCode;
        public int warehouseID;
        public string warehouseCode;
        public int branchID;
        public string branchCode;
        public string options;



        //public DateTime createTime;
    }
}
