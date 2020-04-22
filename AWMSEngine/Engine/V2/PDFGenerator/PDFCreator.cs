using DinkToPdf;
using iTextSharp.text;
using iTextSharp.text.pdf;
using iTextSharp.text.pdf.draw;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.PDFGenerator
{
    public class PDFCreator : BaseEngine<PDFCreator.TReq, dynamic>
    {
        public class TReq
        {
            public string formCode;

        }
      
        protected override dynamic ExecuteEngine(TReq reqVO)
        {
            try
            {
                var globalSettings = new GlobalSettings
                {
                    ColorMode = ColorMode.Color,
                    Orientation = Orientation.Portrait,
                    PaperSize = PaperKind.A4,
                    Margins = new MarginSettings { Top = 10 },
                    DocumentTitle = "PDF Report",
                    //Out = fileName
                };

                var objectSettings = new ObjectSettings
                {
                    PagesCount = true,
                    HtmlContent = PDFGeneratorTemplate.GetHTMLString(),
                    WebSettings = { DefaultEncoding = "utf-8", UserStyleSheet = Path.Combine(Directory.GetCurrentDirectory(), "assets", "styles.css") }
                    //, UserStyleSheet = Path.Combine(Directory.GetCurrentDirectory(), "assets", "styles.css") ,
                    //HeaderSettings = { FontName = "Arial", FontSize = 9, Right = "Page [page] of [toPage]", Line = true },
                    // FooterSettings = { FontName = "Arial", FontSize = 9, Line = true, Center = "Report Footer" }
                };

            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }

            return null;
        }
 
    }
}
