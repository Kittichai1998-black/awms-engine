using AMWUtil.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.General
{
    public class GetValueQRCode : BaseEngine<GetValueQRCode.TReq, GetValueQRCode.TRes>
    {

        public class TReq
        {
            public string qr;
        };
        public class TRes
        {
            public string qr;
        };
        protected override TRes ExecuteEngine(TReq reqVO)
        {
            return new TRes { qr = "rest" };
        }
    }
}
