using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.General
{
    public class MappingNewPackAndSTO : BaseEngine<MappingNewPackAndSTO.TReq, MappingNewPackAndSTO.TRes>
    {
     
        public class TReq {
            public string skuCode;

        }
        public class TRes { }
        protected override TRes ExecuteEngine(TReq reqVO)
        {
            throw new NotImplementedException();
        }

    }
}
