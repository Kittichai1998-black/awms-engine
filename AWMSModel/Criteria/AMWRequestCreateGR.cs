using AMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Criteria
{
    public class AMWRequestCreateGR
    {
        public DocumentProcessTypeID? process;
        public string fromCustomer;
        public string fromSupplier;
        public string fromWarehouse;
        public string toWarehouse;
        public string remark;
        public DateTime? actionTime;
        public int? autoPutaway = 0;
        public string ref1;
        public string ref2;
        public string ref3;
        public string ref4;
        public List<ReceiveItem> item;

        public class ReceiveItem
        {
            public string itemNo;
            public string baseNo;
            public string sku;
            public decimal? quantity;
            public string unitType;
            public string orderNo;
            public string batch;
            public string lot;
            public string cartonNo;
            public string auditStatus;
            public DateTime? productionDate;
            public DateTime? expireDate;
            public string ref1;
            public string ref2;
            public string ref3;
            public string ref4;
            public string options;
        }

    }
}
