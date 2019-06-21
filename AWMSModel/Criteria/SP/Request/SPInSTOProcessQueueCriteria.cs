using AWMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Criteria.SP.Request
{
    public class SPInSTOProcessQueueCriteria
    {

        public string skuCode;
        public string baseCode;
        public string warehouseCode;
        public string locationCode;

        public bool useShelfLifeDate;
        public bool useExpireDate;
        public bool useIncubateDate;
        public bool usePickFull;

        public ConditionProcess condition;
        public List<StorageObjectEventStatus> eventStatuses;
        public List<OrderByProcess> orderBys;

        public List<long> @not_pstoIDs;
        public class ConditionProcess
        {
            public string batch;
            public string lot;
            public string orderNo;
            public string options;
            public decimal? baseQty;
        }
        public class OrderByProcess
        {
            public SQLOrderByType orderByType;//0=ASC(FIFO),1=DESC(LIFO)
            public string fieldName;
        }


    }
}
