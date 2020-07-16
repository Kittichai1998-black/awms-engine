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
using static AWMSEngine.Engine.V2.PDFGenerator.PDFGenerator;
using AMWUtil.Common;

namespace AWMSEngine.Engine.V2.PDFGenerator
{
    public class CreateTagQRandBarcode : BaseEngine<CreateTagQRandBarcode.TReq, CreateTagQRandBarcode.TRes>
    {
        public class TReq
        {
            public List<ListsCode> listsCode; 
            //public PageSize pageSize;
            //public TagSize tagSize;
            public LayoutType layoutType;
        }

        public class ListsCode
        {
            public string code;
            public string title;
            public string options;
            //public CodeType codeType;

        }
        //public class PageSize
        //{
        //    public float width;
        //    public float height;
        //    public float marginLeft;
        //    public float marginRight;
        //    public float marginTop;
        //    public float marginBottom;
        //}
        //public class TagSize
        //{
        //    public double width;
        //    public double height; 
        //}
        //public enum CodeType
        //{
        //    BARCODE = 0,
        //    QRCODE = 1
        //}
        public enum LayoutType
        {
            LANDSCAPE_BARCODE = 0,
            PORTRAIT_BARCODE = 1,
            LANDSCAPE_QR = 2,
            PORTRAIT_QR = 3,
            CUSTOM1 = 91,
            CUSTOM2 = 92
        }

        public class TRes
        {
            public byte[] stream;
            public string contentType;
            public string fileName;
        }

        public class OptionConst 
        {
            public const string OPT_ITEMNAME = "itemName";
            public const string OPT_LOT_NO = "lotNo";
            public const string OPT_CONTROL_NO = "controlNo";
            public const string OPT_SUPPLIER = "supplier";
            public const string OPT_CODENO = "codeNo";
            public const string OPT_RECEIVED_DATE = "receivedDate";
            public const string OPT_QTY_RECEIVED = "qtyReceived";
            public const string OPT_PALLET_NO = "palletNo";
        }
        private Font h1;
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
        public BaseFont CreateFont(string fontName)
        {
            string fg = Path.Combine(Environment.CurrentDirectory + "\\assets\\", fontName);
            return BaseFont.CreateFont(fg, BaseFont.IDENTITY_H, BaseFont.EMBEDDED);
        }
        public void GenerateFont()
        {
            BaseFont font_H = CreateFont("thsarabunnew_bold-webfont.ttf");
            h1 = new Font(font_H, 22);
            h2 = new Font(font_H, 20);
            h3 = new Font(font_H, 18);
            h4 = new Font(font_H, 16); 
            h5 = new Font(font_H, 14); 
            h6 = new Font(font_H, 12);
            h7 = new Font(font_H, 10);

            BaseFont font_p = CreateFont("thsarabunnew-webfont.ttf");
            p1 = new Font(font_p, 22);
            p2 = new Font(font_p, 20);
            p3 = new Font(font_p, 18);
            p4 = new Font(font_p, 16);
            p5 = new Font(font_p, 14);
            p6 = new Font(font_p, 12);
            p7 = new Font(font_H, 10);
        }


        protected override TRes ExecuteEngine(TReq reqVO)
        {
             
            this.GenerateFont();
            var res = new TRes();
            MemoryStream workStream = new MemoryStream();
            //สร้าง element ที่จัดใส่ในเเต่ละหน้า
            Document document = new Document(); 
            switch (reqVO.layoutType)
            {
                case LayoutType.LANDSCAPE_BARCODE:
                    document.SetPageSize(new Rectangle(100, 80));
                    break;
                case LayoutType.PORTRAIT_BARCODE:
                    document.SetPageSize(new Rectangle(100, 80));
                    break;
                case LayoutType.LANDSCAPE_QR:
                    document.SetPageSize(new Rectangle(100, 80));
                    break;
                case LayoutType.PORTRAIT_QR:
                    document.SetPageSize(new Rectangle(100, 80));
                    break;
                case LayoutType.CUSTOM1:
                    document.SetPageSize(new Rectangle(432, 288));
                    document.SetMargins(5f, 5f, 5f, 5f);
                    break;                
            }
            
            PdfWriter.GetInstance(document, workStream).CloseStream = false;
            document.Open();
            
            switch (reqVO.layoutType)
            {
                case LayoutType.LANDSCAPE_BARCODE:
                    document = CreateLand_Barcode(document, reqVO.listsCode);
                    break;
                case LayoutType.PORTRAIT_BARCODE:
                    document = CreatePort_Barcode(document, reqVO.listsCode);
                    break;
                case LayoutType.LANDSCAPE_QR:
                    document = CreateLand_QR(document, reqVO.listsCode);
                    break;
                case LayoutType.PORTRAIT_QR:
                    document = CreatePort_QR(document, reqVO.listsCode);
                    break;
                case LayoutType.CUSTOM1:
                    document = CreateCustom1(document, reqVO.listsCode);
                    break;
                case LayoutType.CUSTOM2:
                    document = CreateCustom2(document, reqVO.listsCode);
                    break;
            }


            document.Close();

            res.stream = workStream.ToArray();
            res.contentType = "application/pdf";
            return res;
            
        }
       
        public Document CreateCustom1(Document document, List<ListsCode> listsCode)
        {
            listsCode.ForEach(info => {
                document.Add(GetHeaderQR(info.title, info.code));
                document.Add(GetDetail(info.options));
                //document.Add(new Paragraph(info.title, h4));
                document.NewPage();
            });

            return document;
        }
        public Document CreateCustom2(Document document, List<ListsCode> listsCode)
        {
            return null;
        }
        public Document CreateLand_Barcode(Document document, List<ListsCode> listsCode)
        {
            return null;
        }
        public Document CreatePort_Barcode(Document document, List<ListsCode> listsCode)
        {
            return null;
        }
        public Document CreateLand_QR(Document document, List<ListsCode> listsCode)
        {
            return null;
        }
        public Document CreatePort_QR(Document document, List<ListsCode> listsCode)
        {
            return null;
        }

        private PdfPTable GetHeaderQR(string title, string qrcode)
        {
            PdfPTable headerTable = new PdfPTable(2);
            headerTable.TotalWidth = 422f;
            headerTable.HorizontalAlignment = 0;
            headerTable.DefaultCell.Border = Rectangle.BOX;

            float[] headerTableColWidth = new float[2];
            headerTableColWidth[0] = 367f;
            headerTableColWidth[1] = 55f;
            headerTable.SetWidths(headerTableColWidth);
            headerTable.LockedWidth = true;

            PdfPCell headerTableCell_0 = new PdfPCell(new Phrase(title, h1));
            headerTableCell_0.HorizontalAlignment = Element.ALIGN_CENTER;
            headerTableCell_0.VerticalAlignment = Element.ALIGN_MIDDLE;
            headerTable.AddCell(headerTableCell_0);
            
            var qr_img = new GenerateTagCode().CreateQRCode(qrcode);
            iTextSharp.text.Image png = iTextSharp.text.Image.GetInstance(qr_img);
            png.ScaleAbsolute(53, 53);

            PdfPCell headerTableCell_1 = new PdfPCell(png);
            headerTableCell_1.HorizontalAlignment = Element.ALIGN_CENTER;
            headerTableCell_0.VerticalAlignment = Element.ALIGN_MIDDLE;
            headerTableCell_1.Padding = 1f;
            headerTable.AddCell(headerTableCell_1);
            
            return headerTable;
        }
        private PdfPTable GetDetail(string details)
        {
            var jsond = ObjectUtil.QryStrToDynamic(details);
            
            var itemName = jsond[OptionConst.OPT_ITEMNAME].Value ?? "";
            var lotNo = jsond[OptionConst.OPT_LOT_NO].Value ?? "";
            var controlNo = jsond[OptionConst.OPT_CONTROL_NO].Value ?? "";
            var supplier = jsond[OptionConst.OPT_SUPPLIER].Value ?? "";
            var codeNo = jsond[OptionConst.OPT_CODENO].Value ?? "";
            var receivedDate = jsond[OptionConst.OPT_RECEIVED_DATE].Value ?? "";
            var qtyReceived = jsond[OptionConst.OPT_QTY_RECEIVED].Value ?? "";
            var palletNo = jsond[OptionConst.OPT_PALLET_NO].Value ?? "";
            PdfPTable table = new PdfPTable(2);
            table.TotalWidth = 422f;
            table.HorizontalAlignment = 0;
            table.DefaultCell.Border = Rectangle.BOX;
            //table.SpacingBefore = 5;
            //table.SpacingAfter = 20;

            PdfPCell tableCell_0 = new PdfPCell(new Phrase("Item Name ", h6));
            tableCell_0.HorizontalAlignment = Element.ALIGN_LEFT;
            tableCell_0.VerticalAlignment = Element.ALIGN_MIDDLE;
            tableCell_0.Border = Rectangle.NO_BORDER;
            table.AddCell(tableCell_0);
            PdfPCell tableCell_1 = new PdfPCell(new Phrase(itemName, p6));
            tableCell_1.HorizontalAlignment = Element.ALIGN_LEFT;
            tableCell_1.VerticalAlignment = Element.ALIGN_MIDDLE;
            tableCell_1.Border = Rectangle.BOTTOM_BORDER;
            table.AddCell(tableCell_1);
            return table;
        }
    }
}
