using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Criteria.SP.Response
{
    public class SPOutQueueResponseCriteria
    {
        public string souWarehouseCode;//รหัสคลังสินค้า
        public string souAreaCode;//รหัสโซน
        public string souLocationCode;//รหัสเกต
        public string desWarehouseCode;//รหัสคลังสินค้า
        public string desAreaCode;//รหัสโซน
        public string desLocationCode;//รหัสเกต
        public int queueID;//รหัสคิว
        public BaseInfo baseInfo;//ข้อมูลพาเลทและสินค้าในพาเลท
        public class BaseInfo
        {
            public string baseCode;//รหัสพาเลท
            public List<PackInfo> packInfos;//ข้อมูลสินค้าในพาเลท
            public class PackInfo
            {
                public string packCode;//รหัส Packet
                public int packQty;//จำนวน Packet
                public string skuCode;//รหัส SKU
                public int skuQty;//จำนวนสินค้านับจาก SKU
                public string lot;
                public string batch;

                public DateTime? minProductDate;//วันผลิด ต่ำสุดจากทั้งหมดใยพาเลท
                public DateTime? maxProductDate;//วันผลิด สูงสุดจากทั้งหมดใยพาเลท
                public DateTime? minExpireDate;//วันหมดอายุ ต่ำสุดจากทั้งหมดใยพาเลท
                public DateTime? maxExpireDate;//วันหมดอายุ สูงสุดจากทั้งหมดใยพาเลท
            }
        }
    }
}
