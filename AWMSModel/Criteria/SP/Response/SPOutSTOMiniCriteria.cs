using AWMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Criteria.SP.Response
{
    public class SPOutSTOMiniCriteria
    {
        public long? id;
        public StorageObjectType type;
        public int? mstID;
        public int? skuID;
        public long? parentID;
        public StorageObjectType? parentType;
        public string code;
        public string name;
        public int warehouseID;
        public int areaID;
        public decimal qty;
        public int unitID;
        public decimal baseQty;
        public int baseUnitID;
        public decimal? widthM;
        public decimal? lengthM;
        public decimal? heightM;
        public decimal? weiKG;
        public decimal? mstWeiKG;
        public int? objectSizeID;
        public string orderNo;
        public string lot;
        public string batch;
        public StorageObjectEventStatus eventStatus;
        //public int? sizeLevel;
        //public string innerSizeLevels;
        public string options;
        public DateTime? productDate;
        public DateTime? expiryDate;
        public string refID;
        public string ref1;
        public string ref2;
        public string ref3;
        public string ref4;
        public bool IsHold;
        public AuditStatus AuditStatus;
        public bool IsStock;
        public string itemNo;
        public string cartonNo;
        public int? skuTypeID;
        public DateTime? shelfLifeDate;
        public DateTime? incubationDate;
    }
}
