using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using AWMSEngine.HubService;
using DinkToPdf;
using DinkToPdf.Contracts;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace AWMSEngine.Controllers.V2
{
    [Route("api/pdfcreator")]
    [ApiController]
    public class PDFCreatorController : BaseController
    {
        public PDFCreatorController(IHubContext<CommonMessageHub> commonMsgHub, IWebHostEnvironment hostingEnvironment, IConverter converter) : base(commonMsgHub, hostingEnvironment, converter)
        {
        }

        [HttpGet]
        public IActionResult CreatePDF()
        {
            //string fileName = @"D:\PDFConvert\Employee_Report2.pdf";

            //Directory.CreateDirectory(Path.GetDirectoryName(fileName));
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
               // HtmlContent = TemplateGenerator.GetHTMLString(),
                WebSettings = { DefaultEncoding = "utf-8", UserStyleSheet = Path.Combine(Directory.GetCurrentDirectory(), "assets", "styles.css") }
                //, UserStyleSheet = Path.Combine(Directory.GetCurrentDirectory(), "assets", "styles.css") ,
                //HeaderSettings = { FontName = "Arial", FontSize = 9, Right = "Page [page] of [toPage]", Line = true },
                // FooterSettings = { FontName = "Arial", FontSize = 9, Line = true, Center = "Report Footer" }
            };

            var pdf = new HtmlToPdfDocument()
            {
                GlobalSettings = globalSettings,
                Objects = { objectSettings, objectSettings }
            };

            //_converter.Convert(pdf);
            //return Ok("Successfully created PDF document.");
            var file = Converter.Convert(pdf);
            return File(file, "application/pdf");
            //return File(file, "application/pdf", "EmployeeReport.pdf");
        }
    }
}
