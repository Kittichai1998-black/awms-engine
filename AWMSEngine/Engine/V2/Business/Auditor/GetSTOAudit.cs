using AWMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.Auditor
{
    public class GetSTOAudit : BaseEngine<GetSTOAudit.TReq, GetSTOAudit.TRes>
    {
      
        public class TReq
        {
            public long? bstoID;
            public string bstoCode;
        }
        public class TRes
        {
            public List<long> docIDs;
            public string bstoCode;
            public long bstoID;
            public List<STOItems> stoItems;
            public class STOItems
            {
                public long pstoID;
                public string pstoCode;
                public string lot;
                public string cartonNo;
                public string orderNo;
                public string batch;
                public string itemNo;
                public string ref1;
                public string ref2;
                public string ref3;
                public string ref4;
                public List<PickItems> pickItems;

                public class PickItems
                {
                    public long? bstoID;
                    public long? pstoID;
                    public long? ad_docID;
                    public string ad_docCode;
                    public long? ad_docItemID;
                    public long? distoID;
                    public DocumentProcessTypeID processTypeID;
                    public string processTypeName;
                    public decimal? qty;
                    public string unitCode;
                    public decimal? baseQty;
                    public string baseUnitCode;
                    public string destination;
                    public string remark;
                }
            }
        }

        protected override TRes ExecuteEngine(TReq reqVO)
        {
            
            
            throw new NotImplementedException();
        }

    }
}
