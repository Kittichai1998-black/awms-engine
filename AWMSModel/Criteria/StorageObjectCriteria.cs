using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria.SP.Response;
using System;
using System.Collections.Generic;
using System.Text;
using System.Linq;
using AMWUtil.Common;
using AWMSModel.Entity;
using AMWUtil.Logger;
using AMWUtil.Exception;

namespace AWMSModel.Criteria
{
    public partial class StorageObjectCriteria : ITreeObject
    {
        public long? id;
        public StorageObjectType type;
        public long? mstID;
        public long? skuID;
        public long? parentID;
        public long warehouseID;
        public long? areaID;
        public StorageObjectType? parentType;
        public string code;
        public string name;
        public string orderNo;
        public string lot;
        public string batch;
        public string cartonNo;
        public string itemNo;
        public decimal qty;
        public long unitID;
        public string unitCode;
        public decimal baseQty;
        public long baseUnitID;
        public string baseUnitCode;

        public decimal? lengthM;
        public decimal? widthM;
        public decimal? heightM;
        public decimal? weiKG;
        public decimal? mstWeiKG;
        public decimal? innerWeiKG;
        public decimal volume;
        public decimal innerVolume;

        public DateTime? incubationDate;
        public DateTime? productDate;
        public DateTime? expiryDate;
        public bool isFocus;
        public StorageObjectEventStatus eventStatus;
        public string options;
        public List<StorageObjectCriteria> mapstos;
        public string refID;
        public string ref1;
        public string ref2;
        public string ref3;
        public string ref4;
        public bool IsHold;
        public bool IsStock;
        public AuditStatus AuditStatus;
        public long? skuTypeID;
        public string skuTypeName;
        public long? forCustomerID;
        public long? transportObject_ID;
        public DateTime? ShelfLifeDate;

        public ObjectSize objectSize;
        public class ObjectSize
        {
            public long id;
            public string name;
            public decimal volume;
            public decimal? minInnerWeiKG;
            public decimal? maxInnerWeiKG;
            public decimal? minInnerVolume;
            public decimal? maxInnerVolume;
            public decimal? weiAccept;
            public List<ObjectSizeInner> inners;
            public class ObjectSizeInner
            {
                public int innerObjectSizeID;
                public string innerObjectSizeName;
                //public decimal innerSumVolume;
            }
        }


    }
}
