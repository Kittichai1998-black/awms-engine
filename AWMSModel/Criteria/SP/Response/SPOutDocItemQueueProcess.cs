using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Criteria.SP.Response
{
    public class SPOutDocItemQueueProcess
    {
        public long DocumentItem_ID;
        public long sto_ID;
        public string sto_rootCode;
        public string sto_code;
        public string lot;
        public string batch;
        public string order_no;
        public decimal? base_Qty;

    }
}
