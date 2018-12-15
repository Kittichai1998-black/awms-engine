using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business.Picking
{
    public class SelectIssuedPicking : BaseEngine<SelectIssuedPicking.TReq, string>
    {
        public class TReq
        {
            public string palletCode;
            public long? docID;
        }

        public class TRes
        {
            public string palletCode;
            public long? docID;
        }

        protected override string ExecuteEngine(TReq reqVO)
        {
            
            throw new NotImplementedException();
        }
    }
}
