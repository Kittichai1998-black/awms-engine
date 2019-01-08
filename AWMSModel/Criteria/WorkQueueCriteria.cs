using AWMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Criteria
{
    public class WorkQueueCriteria
    {
        public long? queueID;//รหัสคิว
        public int seq;
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

        public BaseInfo baseInfo;//ข้อมูลพาเลทและสินค้าในพาเลท
        public class BaseInfo
        {
            public string baseCode;//รหัสพาเลท
            public List<PackInfo> packInfos;//ข้อมูลสินค้าในพาเลท
            public class PackInfo
            {
                public string packCode;//รหัส Packet
                public decimal packQty;//จำนวน Packet
                public string skuCode;//รหัส SKU
                public decimal skuQty;//จำนวนสินค้านับจาก SKU
                public string orderNo;
                public string lot;
                public string batch;

                //public DateTime? minProductDate;//วันผลิด ต่ำสุดจากทั้งหมดใยพาเลท
                //public DateTime? maxProductDate;//วันผลิด สูงสุดจากทั้งหมดใยพาเลท
                //public DateTime? minExpireDate;//วันหมดอายุ ต่ำสุดจากทั้งหมดใยพาเลท
                //public DateTime? maxExpireDate;//วันหมดอายุ สูงสุดจากทั้งหมดใยพาเลท
            }
        }
    }
}
