using AMWUtil.Common;
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
            return StyleFont(type, 12f);
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
            var size =document.PageSize;
            foreach (var table in reqVO.tables)
            {
                document.Add(GenerateTable(table));
            }

            PdfPTable GenerateTable(PDFContentCriteria.Table itemTable)
            {
                PdfPTable table = new PdfPTable(itemTable.headers.First().cells.Count);
                table.TotalWidth = itemTable.total_width;
                table.HorizontalAlignment = itemTable.hor_align != null ? (int)typeof(Element).GetField(itemTable.hor_align).GetValue(null) : Element.ALIGN_LEFT;
                table.DefaultCell.Border = itemTable.def_cell_border != null ? (int)typeof(Rectangle).GetField(itemTable.def_cell_border).GetValue(null) : Rectangle.NO_BORDER;
                table.LockedWidth = itemTable.locked_width;
                foreach (var row in itemTable.headers)
                {
                    add_row(table, row);
                }
                //foreach (var row in itemTable.bodys)
                //{
                //    add_row(table, row);
                //}
                //foreach (var row in itemTable.footers)
                //{
                //    add_row(table, row);
                //}

                void add_row( PdfPTable table, PDFContentCriteria.Table.Row row)
                {
                    foreach(var cell in row.cells)
                    {

                        Font font = StyleFont(cell.font_style != null ? cell.font_style : "normal", cell.font_size != null ? cell.font_size.Get<float>() : 12f);
                        PdfPCell addcell = new PdfPCell(new Phrase(cell.text, font));
                        addcell.HorizontalAlignment = cell.hor_align != null ?(int)typeof(Element).GetField(cell.hor_align).GetValue(null) : Element.ALIGN_LEFT;
                        addcell.VerticalAlignment = cell.ver_align != null ? (int)typeof(Element).GetField(cell.ver_align).GetValue(null) : Element.ALIGN_MIDDLE;
                        addcell.Border = cell.border != null ? (int)typeof(Rectangle).GetField(cell.border).GetValue(null) : Rectangle.NO_BORDER;
                        addcell.Padding = cell.padding;
                        addcell.PaddingBottom = cell.padding_bottom;
                        addcell.PaddingLeft = cell.padding_left;
                        addcell.PaddingRight = cell.padding_right;
                        addcell.PaddingTop = cell.padding_top;
                        table.AddCell(addcell);
                    }
                }

                return table;
            }

            document.Close();

            res.stream = workStream.ToArray();
            res.contentType = "application/pdf";
            return res;
        }
 
    }
}
