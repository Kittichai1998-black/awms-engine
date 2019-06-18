using AWMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using static AWMSEngine.Engine.Business.Issued.ProcessQueueIssue;

namespace AWMSEngine.Engine.V2.Business.WorkQueue
{
    public class ASRSProcessQueue : BaseEngine<ASRSProcessQueue.TReq, ASRSProcessQueue.TRes>
    {
        public class TReq
        {
            public List<ProcessDocument> processDocumnets;
            public class ProcessDocument
            {
                public long docID;
                public List<ProcessDocumentItem> docItems;
                public class ProcessDocumentItem
                {
                    public long docItemID;
                    public string skuCode;
                    public string baseCode;
                    public string areaLocationCode;
                    public List<ConditionProcess> conditions;
                    public List<OrderByProcess> orderBys;
                    public bool useShelfLife;
                    public bool useExpireDate;
                    public bool useIncubateDate;
                    public bool useFullPallet;
                    public StorageObjectEventStatus evtStatus;
                    public decimal qty;
                    public float percentRandom;
                    public int priority;
                    public class ConditionProcess
                    {
                        public string batch;
                        public string lot;
                        public string orderNo;
                        public string ref1;
                        public string ref2;
                        public string refID;
                        public decimal qty;
                    }
                    public class OrderByProcess
                    {
                        public string columnName;
                        public SQLOrderByType orderByType;//0=ASC(FIFO),1=DESC(LIFO)
                    }
                }
            }
        }
        public class TRes
        {

        }
        protected override TRes ExecuteEngine(TReq reqVO)
        {
            TRes res = new TRes();

            return res;
        }

        private void init(TReq reqVO)
        {
            
        }

    }
}
