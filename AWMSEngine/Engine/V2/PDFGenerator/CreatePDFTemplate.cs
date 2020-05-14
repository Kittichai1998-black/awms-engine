using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using AWMSModel.Entity;
using iTextSharp.text;
using iTextSharp.text.pdf;
using iTextSharp.text.pdf.draw;
namespace AWMSEngine.Engine.V2.PDFGenerator
{
    public class CreatePDFTemplate
    {
        public class TRes
        {
            public byte[] stream;
            public string contentType;
            public string fileName;
        }
        public class GroupLayout
        {
            public long pageSeq;
            public List<ams_PrintLayout> printLayout;
        };
        public class HeadAttrModel
        {
            public int order;
            public string head_name;
            public string head_key;
        };

        public TRes createPDF<T>(string formCode, T param)
            where T : new()
        {
            TRes res = new TRes();

            MemoryStream workStream = new MemoryStream();
            Document document = new Document(PageSize.A4, 30, 30, 20, 20);
            PdfWriter.GetInstance(document, workStream).CloseStream = false;

            document.Open();
            document.Add(new Paragraph("Hello World"));
            document.Add(new Paragraph(DateTime.Now.ToString()));
            document.Close();

            res.stream = workStream.ToArray();
            res.contentType = "application/pdf";
            res.fileName = formCode + ".pdf";
            return res;
        }
    }
}
