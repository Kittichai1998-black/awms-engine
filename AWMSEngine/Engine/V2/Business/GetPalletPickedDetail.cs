using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business
{
    public class GetPalletPickedDetail : BaseEngine<GetPalletPickedDetail.TReq, GetPalletPickedDetail.TRes>
    {
        public class TReq
        {
            public string qr;

        }
        public class TRes
        {

        }
        protected override TRes ExecuteEngine(TReq reqVO)
        {
            throw new NotImplementedException();
        }
    }
}
