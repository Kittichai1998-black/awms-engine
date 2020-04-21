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
            public string baseCode;
        }

        private Font h1;
        private Font bold;
        private Font smallBold;
        private Font normal;
        private Font smallNormal;

        protected override dynamic ExecuteEngine(TReq reqVO)
        {
            try
            {

                /* iTextSharp.text.Document pdfDoc = new iTextSharp.text.Document(PageSize.A4, 30, 30, 20, 20);
                 string fileName = @"D:\PDF\HelloWorld.pdf";
                 Directory.CreateDirectory(Path.GetDirectoryName(fileName));
                 PdfWriter.GetInstance(pdfDoc, new FileStream(fileName, FileMode.Create));
                 //PdfWriter.GetInstance(pdfDoc, System.Web.HttpContext.Current.Response.OutputStream);
                 pdfDoc.Open();

                 BaseFont bf_bold = BaseFont.CreateFont(@"D:\Fonts\THSarabunNewBold.TTF", BaseFont.IDENTITY_H, BaseFont.NOT_EMBEDDED, true);

                 h1 = new Font(bf_bold, 18);
                 bold = new Font(bf_bold, 16);
                 smallBold = new Font(bf_bold, 14);

                 // Normal
                 //BaseFont bf_normal = GetFont2("THSarabunNew.ttf");
                 BaseFont bf_normal = BaseFont.CreateFont(@"D:\Fonts\THSarabunNew.TTF", BaseFont.IDENTITY_H, BaseFont.NOT_EMBEDDED, true);
                 normal = new Font(bf_normal, 16);
                 smallNormal = new Font(bf_normal, 14);
                 pdfDoc.Add(GetHeader());
                 LineSeparator line = new LineSeparator();
                 pdfDoc.Add(line);
                 pdfDoc.Close();
                 */
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }

            return null;
        }

        private PdfPTable GetHeader()

        {
            PdfPTable headerTable = new PdfPTable(2);
            headerTable.TotalWidth = 530f;
            headerTable.HorizontalAlignment = 0;
            headerTable.SpacingAfter = 20;
            //headerTable.DefaultCell.Border = Rectangle.NO_BORDER;

            float[] headerTableColWidth = new float[2];
            headerTableColWidth[0] = 220f;
            headerTableColWidth[1] = 310f;

            headerTable.SetWidths(headerTableColWidth);
            headerTable.LockedWidth = true;

            iTextSharp.text.Image png = iTextSharp.text.Image.GetInstance("C:\\Users\\6100949\\Downloads\\logoamw.jpg");
            png.ScaleAbsolute(40, 40);

            PdfPCell headerTableCell_0 = new PdfPCell(png);
            headerTableCell_0.HorizontalAlignment = Element.ALIGN_LEFT;
            headerTableCell_0.Border = Rectangle.NO_BORDER;
            headerTable.AddCell(headerTableCell_0);

            PdfPCell headerTableCell_1 = new PdfPCell(new Phrase("บันทึกข้อความ", h1));
            headerTableCell_1.HorizontalAlignment = Element.ALIGN_LEFT;
            headerTableCell_1.VerticalAlignment = Element.ALIGN_BOTTOM;
            headerTableCell_1.Border = Rectangle.NO_BORDER;
            headerTable.AddCell(headerTableCell_1);

            return headerTable;
        }
    }
}
