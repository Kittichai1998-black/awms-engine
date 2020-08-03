using AWMSModel.Criteria;
using iTextSharp.text;
using iTextSharp.text.pdf;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.PDFGenerator
{
    public class CreatePDFTemplate : BaseEngine<PDFContentCriteria, CreatePDFTemplate.TRes>
    {
        
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

        public Font GetFont(string fontName)
        {
            //var fontName = "TH Sarabun New";
            if (!FontFactory.IsRegistered(fontName))
            {
                //var fontPath = Environment.GetEnvironmentVariable("SystemRoot") + "\\fonts\\THSarabunNew.ttf";
                string fontPath = Path.Combine(Environment.CurrentDirectory + "\\assets\\", fontName + ".ttf");
                FontFactory.Register(fontPath);
            }

            return FontFactory.GetFont(fontName, BaseFont.IDENTITY_H, BaseFont.EMBEDDED);
        }
        public void GenerateFont()
        {
            font_normal = GetFont("thsarabunnew").BaseFont;
            font_bold = GetFont("thsarabunnew-bold").BaseFont;
            font_bolditalic = GetFont("thsarabunnew-bolditalic").BaseFont;
            font_italic = GetFont("thsarabunnew-italic").BaseFont;
        }
       
        public Font StyleFont(string type, float size)
        {
            Font _font;
            switch (type) {
                case "normal":
                    _font = new Font(font_normal, size);
                    break;
                case "bold":
                    _font = new Font(font_bold, size);
                    break;
                case "bolditalic":
                    _font = new Font(font_bolditalic, size);
                    break;
                case "italic":
                    _font = new Font(font_italic, size);
                    break;
                default:
                    _font = new Font(font_normal, size);
                    break;
            }
            return _font;
        }
        public Font StyleFont(string type)
        {
            return StyleFont(type, 12);
        }
        protected override TRes ExecuteEngine(PDFContentCriteria reqVO)
        {
            this.GenerateFont();

            var res = new TRes();
            MemoryStream workStream = new MemoryStream();
            Document document = new Document();
            document.SetPageSize(PageSize.A4.Rotate());
            document.SetMargins(15f, 15f, 15f, 10f);
            PdfWriter.GetInstance(document, workStream).CloseStream = false;
            document.Open();

            ///
            Paragraph para = new Paragraph(new Phrase("Hello 1234567890 กยบาสวหร่เสหหผแ", StyleFont("bold",16)));
            document.Add(para);
            Paragraph para2 = new Paragraph(new Phrase("Hello 1234567890 กยบาสวหร่เสหหผแ", StyleFont("bolditalic")));
            document.Add(para2);
            document.Close();

            res.stream = workStream.ToArray();
            res.contentType = "application/pdf";
            return res;
        }

    }
}
