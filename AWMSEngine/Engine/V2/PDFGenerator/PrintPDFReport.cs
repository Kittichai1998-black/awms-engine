using AMWUtil.Common;
using AMSModel.Criteria;
using iTextSharp.text;
using iTextSharp.text.pdf;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.PDFGenerator
{
    public class PrintPDFReport : BaseEngine<PDFContentCriteria, PrintPDFReport.TRes>
    {
        public class TRes
        {
            public byte[] stream;
            public string contentType;
            public string fileName;
        }
        private static BaseFont font_normal = GetFont("thsarabunnew").BaseFont;
        private static BaseFont font_bold  = GetFont("thsarabunnew-bold").BaseFont;
        private static BaseFont font_bolditalic = GetFont("thsarabunnew-bolditalic").BaseFont;
        private static BaseFont font_italic = GetFont("thsarabunnew-italic").BaseFont;

        public static Font GetFont(string fontName)
        {
            if (!FontFactory.IsRegistered(fontName))
            {
                //var fontPath = Environment.GetEnvironmentVariable("SystemRoot") + "\\fonts\\THSarabunNew.ttf";
                string fontPath = Path.Combine(Environment.CurrentDirectory + "\\assets\\fonts\\", fontName + ".ttf");
                FontFactory.Register(fontPath);
            }

            return FontFactory.GetFont(fontName, BaseFont.IDENTITY_H, BaseFont.EMBEDDED);
        }
       
        public static Font StyleFont(string type, float size)
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
        public static Font StyleFont(string type)
        {
            return StyleFont(type, 12f);
        } 
        protected override TRes ExecuteEngine(PDFContentCriteria reqVO)
        {
            var res = new TRes();
            MemoryStream workStream = new MemoryStream();
            Document document = new Document();
            document.SetPageSize(PageSize.A4.Rotate());
            float marginsLeft = reqVO.margins_left > 0 ? reqVO.margins_left : 15f;
            float marginsRight = reqVO.margins_right > 0 ? reqVO.margins_right : 15f;
            float marginsTop = reqVO.margins_top > 0 ? reqVO.margins_top : 35f;
            float marginsBottom = reqVO.margins_bottom > 0 ? reqVO.margins_bottom : 30f;
            document.SetMargins(marginsLeft, marginsRight, marginsTop, marginsBottom);
            PdfWriter pdfWriter = PdfWriter.GetInstance(document, workStream);
            document.Open();

            if (reqVO.header != null || reqVO.footer != null)
            {
                HeaderFooter objHeaderFooter = new HeaderFooter();
                if(reqVO.header != null)
                    objHeaderFooter.SetHeader(reqVO.header);
                if (reqVO.footer != null)
                    objHeaderFooter.SetFooter(reqVO.footer);
                pdfWriter.PageEvent = objHeaderFooter;
            }

            ///GenerateTable
            foreach (var table in reqVO.contents)
            {
                document.Add(GenerateTable(pdfWriter, document, table));
            }
            
            document.AddTitle(reqVO.title);
            document.AddCreator("AMW");
            document.AddAuthor("AMW");
            //document.AddHeader("Nothing", "No Header");
            document.Close();

            res.stream = workStream.ToArray();
            res.contentType = "application/pdf";
            return res;
        }
        
        public static PdfPTable GenerateTable(PdfWriter pdfWriter, Document document, PDFContentCriteria.Table itemTable)
        {
            float _contentWidth = document.PageSize.Width - (document.RightMargin + document.LeftMargin);
            PdfPTable table = new PdfPTable(itemTable.headers.First().cells.Count);
            if (itemTable.total_width > 0)
            {
                table.TotalWidth = itemTable.total_width;
            }
            else
            {
                table.TotalWidth = _contentWidth;
                if (itemTable.widths != null)
                {
                    table.SetWidths(itemTable.widths);
                    table.LockedWidth = itemTable.locked_width;
                }
            }
            table.HorizontalAlignment = itemTable.hor_align != null ? (int)typeof(Element).GetField(itemTable.hor_align).GetValue(null) : Element.ALIGN_LEFT;
            table.DefaultCell.Border = itemTable.def_cell_border != null ? (int)typeof(Rectangle).GetField(itemTable.def_cell_border).GetValue(null) : Rectangle.NO_BORDER;
            table.SpacingAfter = itemTable.spacing_after > 0 ? itemTable.spacing_after : 10;
            if (itemTable.headers != null)
            {
                foreach (var row in itemTable.headers)
                {
                    add_row(table, row);
                }
            }
            if (itemTable.bodys != null)
            {
                foreach (var row in itemTable.bodys)
                {
                    add_row(table, row);
                }
                table.HeaderRows = itemTable.headers.Count();
            }
            if (itemTable.footers != null)
            {
                foreach (var row in itemTable.footers)
                {
                    add_row(table, row);
                }
            }

            void add_row(PdfPTable table, PDFContentCriteria.Table.Row row)
            {
                if (row.cells != null)
                {
                    foreach (var cell in row.cells)
                    {

                        Font font = StyleFont(cell.font_style != null ? cell.font_style : "normal", cell.font_size > 0 ? cell.font_size : 10);
                         
                        PdfPCell addcell = new PdfPCell(new Phrase(cell.text == "{page}" ? "Page "+ pdfWriter.PageNumber : cell.text, font));
                        addcell.HorizontalAlignment = cell.hor_align != null ? (int)typeof(Element).GetField(cell.hor_align).GetValue(null) : Element.ALIGN_LEFT;
                        addcell.VerticalAlignment = cell.ver_align != null ? (int)typeof(Element).GetField(cell.ver_align).GetValue(null) : Element.ALIGN_MIDDLE;
                        addcell.Border = cell.border != null ? (int)typeof(Rectangle).GetField(cell.border).GetValue(null) : Rectangle.NO_BORDER;

                        addcell.Padding = cell.padding > 0 ? cell.padding : 5;
                        if (cell.padding_bottom > 0)
                            addcell.PaddingBottom = cell.padding_bottom;
                        if (cell.padding_left > 0)
                            addcell.PaddingLeft = cell.padding_left;
                        if (cell.padding_right > 0)
                            addcell.PaddingRight = cell.padding_right;
                        if (cell.padding_top > 0)
                            addcell.PaddingTop = cell.padding_top;
                        
                        table.AddCell(addcell);
                    }
                }
            }
            return table;
        }

        class HeaderFooter: PdfPageEventHelper
        {
            protected PDFContentCriteria.Table tbHeader;
            protected PDFContentCriteria.Table tbFooter;
            public void SetHeader(PDFContentCriteria.Table tbHeader)
            {
                this.tbHeader = tbHeader;
            }
            public void SetFooter(PDFContentCriteria.Table tbFooter)
            {
                this.tbFooter = tbFooter;
            }
            public override void OnEndPage(PdfWriter writer, Document document)
            {
                if (tbHeader != null)
                {
                    var tableHeader = GenerateTable(writer, document, tbHeader);
                    tableHeader.WriteSelectedRows(0, -1, document.Left, document.PageSize.Height - 10f, writer.DirectContent);
                }
                if (tbFooter != null)
                {
                    var tableFooter = GenerateTable(writer, document, tbFooter);
                    tableFooter.WriteSelectedRows(0, -1, document.Left, tableFooter.TotalHeight + 10f, writer.DirectContent);
                }
            }
        } 
    }
}
