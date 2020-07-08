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
            public List<ListsCode> listsCode;
            public PageSize pageSize;
            public TagSize tagSize;
            public LayoutType layout;
        }

        public class ListsCode
        {
            public string code;
            public string header;
            public string detail;
            public CodeType codeType;

        }
        public class PageSize
        {
            public double width;
            public double height;
            public double marginLeft;
            public double marginRight;
            public double marginTop;
            public double marginBottom;
        }
        public class TagSize
        {
            public double width;
            public double height; 
        }
        public enum CodeType
        {
            BARCODE = 0,
            QRCODE = 1
        }
        public enum LayoutType
        {
            LANDSCAPE = 0,
            VERTICAL = 1
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
