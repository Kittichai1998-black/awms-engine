using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Criteria.SP.Response
{
    public class SPOutDocItemQueueProcess
    {
        public long doci_id;
        public long sto_id;
        public decimal? baseQuantity;
        public string sto_rootCode;
        public string stoCode;
        public long warehouseID;
        public string warehouseCode;
        public long areaID;
        public string sto_packQty;
        public string lot;
        public string batch;
        public string orderNo;
        public string prodDate;
        public DateTime createTime;

    }
}
