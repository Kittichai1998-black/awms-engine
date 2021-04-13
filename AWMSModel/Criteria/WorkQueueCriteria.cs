using AMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Criteria
{
    public class WorkQueueCriteria
    {
        public long? queueID;//รหัสคิว
        public IOType ioType;
        public long seqGroup;
        public long seqItem;
        public int priority;
        public long? queueParentID;
        public string queueRefID;
        public WorkQueueEventStatus queueStatus;

        public string warehouseCode;//รหัสคลังสินค้า
        public string areaCode;//รหัสโซน
        public string locationCode;//รหัสเกต

        public string souWarehouseCode;//รหัสคลังสินค้า
        public string souAreaCode;//รหัสโซน
        public string souLocationCode;//รหัสเกต

        public string desWarehouseCode;//รหัสคลังสินค้า
        public string desAreaCode;//รหัสโซน
        public string desLocationCode;//รหัสเกต
        public string locationBankNumRange;
        public string locationBayNumRange;
        public string locationLvNumRange;
        public BaseInfo baseInfo;//ข้อมูลพาเลทและสินค้าในพาเลท
        public class BaseInfo
        {
            public long id;//รหัสพาเลท
            public string baseCode;//รหัสพาเลท
            public List<PackInfo> packInfos;//ข้อมูลสินค้าในพาเลท
            public class PackInfo
            {
                public string itemNo;
                public string code;
                public decimal qty;
                public string unit;
                public string customer;
                public decimal baseQty;
                public string baseUnit;
                public string batch;
                public string lot;
                public string grade;
                public string orderNo;
                public DateTime? prodDate;

                public string Info1;
                public string Info2;
                public string Info3;
            }
        }
        public List<long> docIDs;
    }
}
