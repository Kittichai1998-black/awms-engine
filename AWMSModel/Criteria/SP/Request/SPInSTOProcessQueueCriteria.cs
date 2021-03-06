using AMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Criteria.SP.Request
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
        public bool useFullPick;
        public string refID;
        
        public long? forCustomerID;
        public long? desCustomerID;
        public long? packUnitID;
        public string packUnitCode;

        public List<AuditStatus> auditStatuses;

        public ConditionProcess condition;
        public List<StorageObjectEventStatus> eventStatuses;
        public List<OrderByProcess> orderBys;

        public List<long> not_pstoIDs;
        public class ConditionProcess
        {
            public string batch;
            public string lot;
            public string orderNo;
            public string options;
            public string refID;
            public string ref1;
            public string ref2;
            public string ref3;
            public string ref4;
            public decimal? baseQty;
        }
        public class OrderByProcess
        {
            public SQLOrderByType orderByType;//0=ASC(FIFO),1=DESC(LIFO)
            public string fieldName;
        }


    }
}
