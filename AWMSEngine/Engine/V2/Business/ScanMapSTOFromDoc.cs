using AWMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business
{
    public class ScanMapSTOFromDoc : BaseEngine<ScanMapSTOFromDoc.TReq, StorageObjectCriteria>
    {
        public class TReq
        {
            public string palletCode;
            public List<DocItems> docItems;
            public class DocItems
            {
                public long id;
                public decimal qty;
            }
        }

        protected override StorageObjectCriteria ExecuteEngine(TReq reqVO)
        {



            throw new NotImplementedException();
        }
    }
}
