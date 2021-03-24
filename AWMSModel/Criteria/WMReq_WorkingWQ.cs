using AMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
namespace AMSModel.Criteria
{
    public class WMReq_WorkingWQ
    {
        public long? queueID;
        public string baseCode;
        public string warehouseCode;
        public string areaCode;
        public string locationCode;
        public DateTime actualTime;
    }
}
