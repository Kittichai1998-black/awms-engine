using AMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
namespace AMSModel.Criteria.API
{
    public class WMReq_DoneWQ
    {
        public long? queueID;
        public string baseCode;
        public string warehouseCode;
        public string areaCode;
        public string locationCode;
        public DateTime actualTime;
    }
}
