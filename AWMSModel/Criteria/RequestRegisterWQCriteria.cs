using AMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Criteria
{
    public class RequestRegisterWQCriteria
    {
        public string baseCode;//รหัสพาเลท
        public IOType ioType = IOType.INBOUND;
        public decimal? weight;//น้ำหนัก Kg.
        public decimal? width;//กว้าง M.
        public decimal? length;//ยาว M.
        public decimal? height;//สูง M.
        public string warehouseCode;//รหัสคลังสินค้า
        public string areaCode;//รหัสโซน
        public string locationCode;//รหัสเกต
        public string desWarehouseCode;
        public string desAreaCode;
        public string desLocationCode;
        public string forCustomerCode;
        public DateTime actualTime;
        public List<string> barcode_pstos;
        public bool autoDoc = false;
        public string options;
    }
}
