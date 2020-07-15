using iTextSharp.text;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.PDFGenerator
{
    public class PDFGenerator : BaseEngine<PDFGenerator.TReq, PDFGenerator.TRes>
    {
        
        public class TReq
        {
            public string fileName;
            public List<PageElements> pageElements;
            public PageSize pageSize;
        }
        public class PageElements
        {
            public List<IElement> elements;
        }
        public class TRes
        {
            public byte[] stream;
            public string contentType;
            public string fileName;
        }
        protected override TRes ExecuteEngine(TReq reqVO)
        {
            var res = new TRes();

            MemoryStream workStream = new MemoryStream();
            //ตัวกลาง สร้างเเต่ละหน้า ตามelementที่ส่งมา


            res.stream = workStream.ToArray();
            res.contentType = "application/pdf";
            res.fileName = reqVO.fileName + ".pdf";
            return res;
        }

    }
}
