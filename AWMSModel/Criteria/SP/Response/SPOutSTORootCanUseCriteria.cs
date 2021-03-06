using AMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Criteria.SP.Response
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
        public string sou_itemNo;

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
        public string des_itemNo;

        public EntityStatus des_status;

        public long docItemID;
        public string code;
        public string name;

        public long rootID;
        public string rootCode;
        public string rootName;
        public long distoID;
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
        public DateTime? ModifyTime;
        public DateTime? CreateTime;

        public string diItemNo;
        public AuditStatus diAuditStatus;
        public string diLot;
        public string diCartonNo;
        public string diBatch;
        public int? diIncubationDay;
        public int? diShelfLifeDay;
        public string diOrderNo;
        public string diOptions;
        public string diRef1;
        public string diRef2;
        public string diRef3;
        public string diRef4;
        public DateTime? diExpireDate;
        public DateTime? diProductionDate;
        public string dcCode;
        public long dcDocType_ID;
        public long dcID;

        //public DateTime createTime;
    }
}
