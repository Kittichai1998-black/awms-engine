using AWMSEngine.ADO.StaticValue;
using AWMSModel.Entity;
using DinkToPdf;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.PDFGenerator
{
    public class CreateHTMLContent
    {
        private ams_PrintForm _printForm;
        private ams_PrintLayout _PrintLayout;
        private ams_PrintField _PrintField;
        public static HtmlToPdfDocument createHtmlToPdfDocument<T>(string formCode, T param)
        {

            var _HtmlContent = GetHTMLString(formCode, param);

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
                HtmlContent = _HtmlContent,
                WebSettings = { DefaultEncoding = "utf-8" }
                //, UserStyleSheet = Path.Combine(Directory.GetCurrentDirectory(), "assets", "styles.css") ,
                //HeaderSettings = { FontName = "Arial", FontSize = 9, Right = "Page [page] of [toPage]", Line = true },
                // FooterSettings = { FontName = "Arial", FontSize = 9, Line = true, Center = "Report Footer" }
            };

            var pdf = new HtmlToPdfDocument()
            {
                GlobalSettings = globalSettings,
                Objects = { objectSettings }
            };
            return pdf;
        }
        public static string GetHTMLString<T>(string formCode, T param)
        {
            var _printForm = StaticValueManager.GetInstant().PrintForm.FirstOrDefault(x => x.Code == formCode);
            var _printLayout = StaticValueManager.GetInstant().PrintLayout.FindAll(x => x.PrintForm_ID == _printForm.ID.Value);
            var _printFieldAll = StaticValueManager.GetInstant().PrintField;
            var query_printField = Enumerable.ToList(from activeItem in _printLayout
                                          join item in _printFieldAll on activeItem.ID equals item.PrintLayout_ID
                                          select item);

            var sb = new StringBuilder();

            sb.Append(@"
                        <html>
                            <head>
                            </head>
                            <body>
                                <div class='header'><h1>This is the generated PDF report!!!</h1></div>
                                <table align='center'>
                                    <tr>
                                        <th>Name</th>
                                        <th>LastName</th>
                                        <th>Age</th>
                                        <th>Gender</th>
                                    </tr>");
            /*foreach (var emp in param.DataTable)
            {
                sb.AppendFormat(@"<tr>
                                    <td>{0}</td>
                                    <td>{1}</td>
                                    <td>{2}</td>
                                    <td>{3}</td>
                                  </tr>", emp.ID, emp.Code, emp.Name, emp.Description);
            }*/
            sb.Append(@"
                                </table>
                            </body>
                        </html>");

            return sb.ToString();

        }

    }
}
