using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Criteria.SP.Response
{
    public class SPOutDocItemQueueProcess
    {
        public long doci_id;
        public long sto_id;
        public string sto_rootCode;
        public string stoCode;
        public string lot;
        public string batch;
        public string orderNo;
        public decimal? baseQuantity;
        public decimal? sto_packQty; 
        public DateTime? prodDate; 
        public DateTime? createTime;
        public long? areaID;
    }
}
