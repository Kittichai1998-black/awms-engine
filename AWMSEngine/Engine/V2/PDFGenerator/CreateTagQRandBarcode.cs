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
            BaseFont font_H = CreateFont("thsarabunnew-bold.ttf");
            h1 = new Font(font_H, 22);
            h2 = new Font(font_H, 20);
            h3 = new Font(font_H, 18);
            h4 = new Font(font_H, 16); 
            h5 = new Font(font_H, 14); 
            h6 = new Font(font_H, 12);
            h7 = new Font(font_H, 10);

            BaseFont font_p = CreateFont("thsarabunnew.ttf");
            p1 = new Font(font_p, 22);
            p2 = new Font(font_p, 20);
            p3 = new Font(font_p, 18);
            p4 = new Font(font_p, 16);
            p5 = new Font(font_p, 14);
            p6 = new Font(font_p, 12);
            p7 = new Font(font_p, 10);
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
                    document.SetPageSize(new Rectangle(230, 103));
                    document.SetMargins(2f, 2f, 2f, 0f);
                    break;
                case LayoutType.PORTRAIT_BARCODE:
                    document.SetPageSize(new Rectangle(100, 80));
                    document.SetMargins(5f, 5f, 5f, 5f);
                    break;
                case LayoutType.LANDSCAPE_QR:
                    document.SetPageSize(new Rectangle(100, 80));
                    document.SetMargins(5f, 5f, 5f, 5f);
                    break;
                case LayoutType.PORTRAIT_QR:
                    document.SetPageSize(new Rectangle(100, 80));
                    document.SetMargins(5f, 5f, 5f, 5f);
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
            }


            document.Close();

            res.stream = workStream.ToArray();
            res.contentType = "application/pdf";
            return res;
            
        }
       
        public Document CreateCustom1(Document document, List<ListsCode> listsCode)
        {
            listsCode.ForEach(info => {
                document.Add(GetHeaderQRCustom1(info.title, info.code));
                document.Add(GetDetailCustom1(info.options));
                document.NewPage();
            });

            return document;
        }
       
        public Document CreateLand_Barcode(Document document, List<ListsCode> listsCode)
        {
            listsCode.ForEach(info =>
            {
                var qrcode = new GenerateTagCode().CreateBarCode(info.code);
                iTextSharp.text.Image img = iTextSharp.text.Image.GetInstance(qrcode);
                img.Alignment = Element.ALIGN_MIDDLE;
                img.ScaleAbsolute(218.3f, 79.4f);
                document.Add(img);
                PdfPTable table = new PdfPTable(1);
                table.TotalWidth = 218.3f;
                table.HorizontalAlignment = Element.ALIGN_CENTER;
                table.DefaultCell.Border = Rectangle.NO_BORDER;
                PdfPCell tableCell_1 = new PdfPCell(new Phrase(info.code, h4));
                tableCell_1.Border = Rectangle.NO_BORDER;
                tableCell_1.HorizontalAlignment = Element.ALIGN_CENTER;
                tableCell_1.VerticalAlignment = Element.ALIGN_CENTER;
                table.AddCell(tableCell_1);
                document.Add(table);
                document.NewPage();
            });

            return document;
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

        private PdfPTable GetHeaderQRCustom1(string title, string qrcode)
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
            headerTableCell_1.VerticalAlignment = Element.ALIGN_MIDDLE;
            headerTableCell_1.Padding = 1f;
            headerTable.AddCell(headerTableCell_1);
            
            return headerTable;
        }
        private PdfPTable GetDetailCustom1(string details)
        {
            var itemName = ObjectUtil.QryStrGetValue(details, OptionConst.OPT_ITEMNAME);
            var lotNo = ObjectUtil.QryStrGetValue(details, OptionConst.OPT_LOT_NO);
            var controlNo = ObjectUtil.QryStrGetValue(details, OptionConst.OPT_CONTROL_NO);
            var supplier = ObjectUtil.QryStrGetValue(details, OptionConst.OPT_SUPPLIER);
            var codeNo = ObjectUtil.QryStrGetValue(details, OptionConst.OPT_CODENO);
            var receivedDate = ObjectUtil.QryStrGetValue(details, OptionConst.OPT_RECEIVED_DATE);
            var qtyReceived = ObjectUtil.QryStrGetValue(details, OptionConst.OPT_QTY_RECEIVED);
            var palletNo = ObjectUtil.QryStrGetValue(details, OptionConst.OPT_PALLET_NO);
            
            PdfPTable table = new PdfPTable(4);
            table.TotalWidth = 422f;
            table.HorizontalAlignment = 0;
            table.DefaultCell.Border = Rectangle.BOX;
            //table.SpacingBefore = 5;
            //table.SpacingAfter = 5;

            float[] tableColWidth = new float[4];
            tableColWidth[0] = 80f;
            tableColWidth[1] = 187f;
            tableColWidth[2] = 65f;
            tableColWidth[3] = 90f;
            table.SetWidths(tableColWidth);
            table.LockedWidth = true;
            //row1
            PdfPCell tableCell_0 = new PdfPCell(new Phrase("Item Name ", h7));
            table.AddCell(SetHeaderCol(tableCell_0));

            PdfPCell tableCell_1 = new PdfPCell(new Phrase(itemName, p7));
            tableCell_1.Colspan = 3;
            table.AddCell(SetInfoCol(tableCell_1));

            //row 2
            tableCell_0 = new PdfPCell(new Phrase("Lot no. ", h7));
            table.AddCell(SetHeaderCol(tableCell_0));

            tableCell_1 = new PdfPCell(new Phrase(lotNo, p7));
            tableCell_1.Colspan = 3;
            table.AddCell(SetInfoCol(tableCell_1));

            //row3
            tableCell_0 = new PdfPCell(new Phrase("Control no. ", h7));
            table.AddCell(SetHeaderCol(tableCell_0));

            tableCell_1 = new PdfPCell(new Phrase(controlNo, p7));
            tableCell_1.Colspan = 3;
            table.AddCell(SetInfoCol(tableCell_1));
            //row4
            tableCell_0 = new PdfPCell(new Phrase("Supplier ", h7));
            table.AddCell(SetHeaderCol(tableCell_0));

            tableCell_1 = new PdfPCell(new Phrase(supplier, p7));
            table.AddCell(SetInfoCol(tableCell_1));

            PdfPCell tableCell_2 = new PdfPCell(new Phrase("Code no. ", h7));
            table.AddCell(SetHeaderCol(tableCell_2));

            PdfPCell tableCell_3 = new PdfPCell(new Phrase(codeNo, p7));
            table.AddCell(SetInfoCol(tableCell_3));

            //row5
            tableCell_0 = new PdfPCell(new Phrase("Quantity Received ", h7));
            table.AddCell(SetHeaderCol(tableCell_0));

            tableCell_1 = new PdfPCell(new Phrase(qtyReceived, p7));
            tableCell_1.Colspan = 3;
            table.AddCell(SetInfoCol(tableCell_1));
            //row6
            tableCell_0 = new PdfPCell(new Phrase("Received Date ", h7));
            table.AddCell(SetHeaderCol(tableCell_0));

            tableCell_1 = new PdfPCell(new Phrase(receivedDate, p7));
            table.AddCell(SetInfoCol(tableCell_1));

            tableCell_2 = new PdfPCell(new Phrase("Pallet No. ", h7));
            table.AddCell(SetHeaderCol(tableCell_2));

            tableCell_3 = new PdfPCell(new Phrase(palletNo, p7));
            table.AddCell(SetInfoCol(tableCell_3));

            PdfPCell SetHeaderCol(PdfPCell pCell)
            {
                pCell.HorizontalAlignment = Element.ALIGN_LEFT;
                pCell.VerticalAlignment = Element.ALIGN_MIDDLE;
                pCell.Border = Rectangle.NO_BORDER;
                pCell.PaddingTop = 15f;
                return pCell;
            }
            PdfPCell SetInfoCol(PdfPCell pCell)
            {
                pCell.HorizontalAlignment = Element.ALIGN_LEFT;
                pCell.VerticalAlignment = Element.ALIGN_MIDDLE;
                pCell.Border = Rectangle.BOTTOM_BORDER;
                pCell.PaddingTop = 15f;
                pCell.PaddingBottom = 5f;
                return pCell;
            }
            return table;
        }
    }
}
