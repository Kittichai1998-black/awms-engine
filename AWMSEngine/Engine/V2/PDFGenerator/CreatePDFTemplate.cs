using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
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
            Rectangle rect = new Rectangle(200f, 200f);
            Document document = new Document(rect, 0, 0, 0, 0);
            //document.SetMargins(-20f, -20f, 0f, 0f);

            PdfWriter.GetInstance(document, workStream).CloseStream = false;

            document.Open();
            //document.Add(new Paragraph("Hello World"));
            //document.Add(new Paragraph(DateTime.Now.ToString()));
            var qrcode = new QRCodeGenerate().CreateQRCode("PAL0000050");
            iTextSharp.text.Image img = iTextSharp.text.Image.GetInstance(qrcode);
            img.Alignment = Element.ALIGN_CENTER;
            //img.SetAbsolutePosition(0, 0);
            img.ScaleAbsolute(200f, 200f); 
            //img.ScalePercent(100);
            document.Add(img);
            document.Close();

            res.stream = workStream.ToArray();
            res.contentType = "application/pdf";
            res.fileName = formCode + ".pdf";
            return res;
        }
    }
}
