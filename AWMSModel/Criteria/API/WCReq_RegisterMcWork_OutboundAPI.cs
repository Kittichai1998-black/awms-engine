using AMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Criteria.API
{
    public class WCReq_RegisterMcWork_OutboundAPI
    {
        public List<TWork> works;
        public class TWork
        {
            public long wqID;
            public int priority;
            public long seqGroup;
            public long seqItem;
            public string baseCode;
            public string desWarehouseCode;
            public string desAreaCode;
            public string desLocationCode;
        }
    }
}
