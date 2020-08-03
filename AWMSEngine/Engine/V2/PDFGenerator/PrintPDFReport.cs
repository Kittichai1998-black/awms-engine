using AMWUtil.Exception;
using iTextSharp.text;
using iTextSharp.text.pdf;
using iTextSharp.text.pdf.draw;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Rectangle = iTextSharp.text.Rectangle;
using AMWUtil.Common;

namespace AWMSEngine.Engine.V2.PDFGenerator
{
    public class PrintPDFReport : BaseEngine<PrintPDFReport.TReq, PrintPDFReport.TRes>
    {
        
        public class TReq
        {
            public List<headers> header;
            public List<contents> content;
            public string spName;
        }
        public class headers
        {
            public string text;
            public string alignment;
        }
        public class contents
        {
            public dynamic text; 
            public string columns; 
        }
        public class TRes
        {
            public byte[] stream;
            public string contentType;
            public string fileName;
        }

        private BaseFont font_bold;
        private BaseFont font_normal;
        private BaseFont font_bolditalic;
        private BaseFont font_italic;


        //private Font h1;
        private Font h2;
        private Font h3;
        private Font h4;
        private Font h5;
        private Font h6;
        private Font h7;
        private Font p1;
        private Font p2;
        private Font p3;
        private Font p4;
        private Font p5;
        private Font p6;
        private Font p7;
        private Font bi;
        public static iTextSharp.text.Font GetFont(string fontName, string fontFile)
        {
            //var fontName = "TH Sarabun New";
            if (!FontFactory.IsRegistered(fontName))
            {
                //var fontPath = Environment.GetEnvironmentVariable("SystemRoot") + "\\fonts\\THSarabunNew.ttf";
                string fontPath = Path.Combine(Environment.CurrentDirectory + "\\assets\\", fontFile);
                FontFactory.Register(fontPath);
            }

            return FontFactory.GetFont(fontName, BaseFont.IDENTITY_H, BaseFont.EMBEDDED);
        }
        public void GenerateFont()
        {
            font_normal = GetFont("thsarabunnew", "thsarabunnew.ttf").BaseFont;
            font_bold = GetFont("thsarabunnew-bold", "thsarabunnew-bold.ttf").BaseFont;
            font_bolditalic = GetFont("thsarabunnew-bolditalic", "thsarabunnew-bolditalic.ttf").BaseFont;
            font_italic = GetFont("thsarabunnew-italic", "thsarabunnew-italic.ttf").BaseFont;
            //h1 = new Font(font_H, 22);
            h2 = new Font(font_bold, 20);
            h3 = new Font(font_bold, 18);
            h4 = new Font(font_bold, 16);
            h5 = new Font(font_bold, 14);
            h6 = new Font(font_bold, 12);
            h7 = new Font(font_bold, 10);

            p1 = new Font(font_normal, 22);
            p2 = new Font(font_normal, 20);
            p3 = new Font(font_normal, 18);
            p4 = new Font(font_normal, 16);
            p5 = new Font(font_normal, 14);
            p6 = new Font(font_normal, 12);
            p7 = new Font(font_normal, 10);
            bi = new Font(font_bolditalic, 24);

        }
        protected override TRes ExecuteEngine(TReq reqVO)
        {
            var res = new TRes();

            this.GenerateFont();
            
            MemoryStream workStream = new MemoryStream();
            Document document = new Document();
            document.SetPageSize(PageSize.A4);
            document.SetMargins(2f, 2f, 2f, 2f);

            PdfWriter.GetInstance(document, workStream).CloseStream = false;
            document.Open();
            ///
            //Paragraph para = new Paragraph(new Phrase("Hello 1234567890 กยบาสวหร่เสหหผแ", bold_header));
            //document.Add(para);
            //Paragraph para2 = new Paragraph(new Phrase("Hello 1234567890 กยบาสวหร่เสหหผแ", bi));
            //document.Add(para2);
            ///
            document.Close();

            res.stream = workStream.ToArray();
            res.contentType = "application/pdf";
            return res;
        }

    }

}
