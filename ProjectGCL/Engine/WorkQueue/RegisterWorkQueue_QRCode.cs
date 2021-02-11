using AWMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Logger;
using AWMSEngine.Engine;
using AWMSEngine.Engine.V2.Business.WorkQueue;
using AMSModel.Criteria;
using AMSModel.Entity;
using AMWUtil.Exception;
using AMWUtil.Common;
using AWMSEngine.Common;
using ADO.WMSStaticValue;
using ADO.WCSStaticValue;
using AWMSEngine.Engine.V2.Business.Document;
using ProjectGCL.Engine.Document;
using AMSModel.Constant.EnumConst;
using AMSModel.Criteria.SP.Request;
using AWMSEngine.Engine.V2.Business.Received;
using AMSModel.Constant.StringConst;
using AMSModel.Criteria.SP.Response;

namespace ProjectGCL.Engine.WorkQueue
{
    public class RegisterWorkQueue_QRCode
    {

        public class TReq //ข้อมูล Request จาก WCS
        {
            public string baseCode;//รหัสพาเลท
            public IOType ioType = IOType.INPUT;
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

}

