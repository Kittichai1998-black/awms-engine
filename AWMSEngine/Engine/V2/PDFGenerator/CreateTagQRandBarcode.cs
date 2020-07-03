using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.PDFGenerator
{
    public class CreateTagQRandBarcode : BaseEngine<CreateTagQRandBarcode.TReq, CreateTagQRandBarcode.TRes>
    {
        public class TReq
        {
            public string textCode;
            public CodeType codeType;
        }
        public enum CodeType
        {
            BARCODE = 0,
            QRCODE = 1
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
