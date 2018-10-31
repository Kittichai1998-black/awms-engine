using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business.WorkQueue
{
    public class WorkingQueueReceiving : BaseEngine<WorkingQueueReceiving.TReq,WorkingQueueReceiving.TRes>
    {
        public class TReq //ข้อมูล Request จาก WCS
        {
            public string baseCode;//รหัสพาเลท
            public decimal weight;//น้ำหนัก Kg.
            public decimal width;//กว้าง M.
            public decimal length;//ยาว M.
            public decimal height;//สูง M.
            public string warehouseCode;//รหัสคลังสินค้า
            public string areaCode;//รหัสโซน
            public string loactionCode;//รหัสเกต
        }
        public class TRes //ข้อมูล Response ไปให้ WCS
        {
            public string warehouseCode;//รหัสคลังสินค้า
            public string areaCode;//รหัสโซน
            public string locationCode;//รหัสเกต
            public int queueID;//รหัสคิว
            public BaseInfo baseInfo;//ข้อมูลพาเลทและสินค้าในพาเลท
            public class BaseInfo
            {
                public string baseCode;//รหัสพาเลท
                public List<PackInfo> packInfos;//ข้อมูลสินค้าในพาเลท
                public class PackInfo
                {
                    public string packCode;//รหัส Packet
                    public string packQty;//จำนวน Packet
                    public string skuCode;//รหัส SKU
                    public string skuQty;//จำนวนสินค้านับจาก SKU
                    public string lot;
                    public string batch;

                    public DateTime? minProductDate;//วันผลิด ต่ำสุดจากทั้งหมดใยพาเลท
                    public DateTime? maxProductDate;//วันผลิด สูงสุดจากทั้งหมดใยพาเลท
                    public DateTime? minExpireDate;//วันหมดอายุ ต่ำสุดจากทั้งหมดใยพาเลท
                    public DateTime? maxExpireDate;//วันหมดอายุ สูงสุดจากทั้งหมดใยพาเลท
                }
            }
        }

        protected override TRes ExecuteEngine(TReq reqVO)
        {
            return null;
        }


    }
}
