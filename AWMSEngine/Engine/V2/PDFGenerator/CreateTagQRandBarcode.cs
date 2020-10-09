using System;
using System.Collections.Generic;
using System.IO;
using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
using AWMSModel.Entity;
using iTextSharp.text;
using iTextSharp.text.pdf;

namespace AWMSEngine.Engine.V2.PDFGenerator
{
    public class CreateTagQRandBarcode : BaseEngine<CreateTagQRandBarcode.TReq, CreateTagQRandBarcode.TRes>
    {
        public class TReq
        {
            public List<ListsCode> listsCode;
            //public PageSize pageSize;
            //public TagSize tagSize;
            public long? docID;
            public LayoutType layoutType;
        }

        public class ListsCode
        {
            public string code;
            public string title;
            public string options;
            public SKUGroupType skuType;
        }
      
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
            public const string OPT_PDF_NO = "_pdf_no";
            public const string OPT_ITEMNAME = "itemName";
            public const string OPT_LOT_NO = "lotNo";
            public const string OPT_CONTROL_NO = "controlNo";
            public const string OPT_SUPPLIER = "supplier";
            public const string OPT_CODENO = "codeNo";
            public const string OPT_MFG_DATE = "mfgdate";
            public const string OPT_EXP_DATE = "expdate";
            public const string OPT_QTY = "qty";
            public const string OPT_UNIT = "unit"; 
            public const string OPT_PALLET_NO = "palletNo";
            public const string OPT_REMARK = "remark";
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
        private Font p8;
        public BaseFont CreateFont(string fontName)
        {
            string fg = Path.Combine(Environment.CurrentDirectory + "\\assets\\fonts\\", fontName);
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
            p8 = new Font(font_p, 8);
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
                    document.SetPageSize(new Rectangle(283.5f, 141.7f));
                    document.SetMargins(1f, 1f, 8f, 5f);
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
                    document.SetPageSize(new Rectangle(420, 300.4f));
                    document.SetMargins(7f, 7f, 7f, 7f);
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
                    document = CreateCustom1(document, reqVO);
                    break;
            }


            document.Close();

            res.stream = workStream.ToArray();
            res.contentType = "application/pdf";
            return res;
            
        }
       
        public Document CreateCustom1(Document document, TReq reqVO)
        {
            //getDoc
            amt_Document doc = ADO.WMSDB.DocumentADO.GetInstant().Get(reqVO.docID.Value, this.BuVO);
            if (doc == null)
                throw new AMWException(Logger, AMWExceptionCode.V1001, "ไม่พบเอกสารรับเข้า");
            int pdfno = String.IsNullOrEmpty(doc.Ref4) ? 1 : int.Parse(doc.Ref4) + 1;
            
            AWMSEngine.ADO.WMSDB.DataADO.GetInstant().UpdateByID<amt_Document>(reqVO.docID.Value, this.BuVO,
                  new KeyValuePair<string, object>[] {
                        new KeyValuePair<string, object>("Ref4", pdfno)
                  });

            string date = DateTime.Now.ToString("dd/MM/yyyy HH:mm:ss");
            var txt = string.Format("print datetime: {0} ครั้งที่ {1}", date, pdfno.ToString());
            PdfPCell printtime = new PdfPCell(new Phrase(txt, p8));
            printtime.HorizontalAlignment = Element.ALIGN_RIGHT;
            printtime.VerticalAlignment = Element.ALIGN_BOTTOM;
            printtime.Border = Rectangle.NO_BORDER;

           
            reqVO.listsCode.ForEach(info => {
                document.Add(GetHeaderQRCustom1(info.title, info.code, printtime));
                document.Add(GetDetailCustom1(info.skuType, info.options));
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
                img.ScaleAbsolute(261f, 100f);
                document.Add(img);
                PdfPTable table = new PdfPTable(1);
                table.TotalWidth = 279.5f;
                table.HorizontalAlignment = Element.ALIGN_CENTER;
                table.DefaultCell.Border = Rectangle.NO_BORDER;
                Font _font = FontFactory.GetFont(BaseFont.HELVETICA_BOLD, 24, Font.NORMAL);
                PdfPCell tableCell_1 = new PdfPCell(new Phrase(info.code, _font));
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

        private PdfPTable GetHeaderQRCustom1(string title, string qrcode, PdfPCell printtime)
        {
            PdfPTable headerTable = new PdfPTable(3);
            headerTable.TotalWidth = 406f;
            headerTable.HorizontalAlignment = Element.ALIGN_LEFT;
            headerTable.DefaultCell.Border = Rectangle.BOX;

            float[] headerTableColWidth = new float[3];
            headerTableColWidth[0] = 80f;
            headerTableColWidth[1] = 271f;
            headerTableColWidth[2] = 55f;
            headerTable.SetWidths(headerTableColWidth);
            headerTable.LockedWidth = true;

            iTextSharp.text.Image pnglogo = iTextSharp.text.Image.GetInstance(Environment.CurrentDirectory + "\\assets\\images\\logo_boss.png");
            pnglogo.ScaleAbsolute(78f, 37f);
            PdfPCell headerTableCell = new PdfPCell(pnglogo);
            headerTableCell.HorizontalAlignment = Element.ALIGN_LEFT;
            headerTableCell.Border = Rectangle.NO_BORDER; 
            headerTableCell.PaddingBottom = 5f;
            headerTable.AddCell(headerTableCell);

            //add print datetime
            printtime.PaddingBottom = 12f;
            printtime.Colspan = 2;
            headerTable.AddCell(printtime);

            Font _font = FontFactory.GetFont(BaseFont.HELVETICA_BOLD, 24, Font.NORMAL);
            PdfPCell headerTableCell_0 = new PdfPCell(new Phrase(title, _font));
            headerTableCell_0.Colspan = 2;
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
        private PdfPTable GetDetailCustom1(SKUGroupType skuType, string details)
        {
            
            var itemName = ObjectUtil.QryStrGetValue(details, OptionConst.OPT_ITEMNAME);
            var lotNo = ObjectUtil.QryStrGetValue(details, OptionConst.OPT_LOT_NO);
            var controlNo = ObjectUtil.QryStrGetValue(details, OptionConst.OPT_CONTROL_NO);
            var supplier = ObjectUtil.QryStrGetValue(details, OptionConst.OPT_SUPPLIER);
            var codeNo = ObjectUtil.QryStrGetValue(details, OptionConst.OPT_CODENO);
            var mfgDate = ObjectUtil.QryStrGetValue(details, OptionConst.OPT_MFG_DATE);
            var expDate = ObjectUtil.QryStrGetValue(details, OptionConst.OPT_EXP_DATE);
            var qtyReceived = ObjectUtil.QryStrGetValue(details, OptionConst.OPT_QTY);
            var palletNo = ObjectUtil.QryStrGetValue(details, OptionConst.OPT_PALLET_NO);
            var unit = ObjectUtil.QryStrGetValue(details, OptionConst.OPT_UNIT);
            var remark = ObjectUtil.QryStrGetValue(details, OptionConst.OPT_REMARK);
            PdfPTable table = new PdfPTable(6);
            table.TotalWidth = 406f;
            table.HorizontalAlignment = 0;
            table.DefaultCell.Border = Rectangle.BOX;

            float[] tableColWidth = new float[6];
            tableColWidth[0] = 60f;
            tableColWidth[1] = 76f;
            tableColWidth[2] = 70f;
            tableColWidth[3] = 60f;
            tableColWidth[4] = 40f;
            tableColWidth[5] = 90f;
            table.SetWidths(tableColWidth);
            table.LockedWidth = true;
            //row1
            PdfPCell tableCell_0 = new PdfPCell(new Phrase("Code no.", h7));
            table.AddCell(SetHeaderCol(tableCell_0));
            PdfPCell tableCell_1 = new PdfPCell(new Phrase(codeNo, p7));
            table.AddCell(SetInfoCol(tableCell_1));

            PdfPCell tableCell_2 = new PdfPCell(new Phrase("Item Name ", h7));
            tableCell_2.HorizontalAlignment = Element.ALIGN_RIGHT;
            tableCell_2 = SetHeaderCol(tableCell_2);
            table.AddCell(tableCell_2);

            PdfPCell tableCell_3 = new PdfPCell(new Phrase(itemName, p7));
            tableCell_3.Colspan = 3;
            table.AddCell(SetInfoCol(tableCell_3));

            //PdfPCell tableCell_4 = new PdfPCell(new Phrase(itemName, p7));
            //table.AddCell(SetInfoCol(tableCell_4));

            if (skuType == SKUGroupType.FG)
            {
                //row 2
                tableCell_0 = new PdfPCell(new Phrase("Lot no. ", h7));
                table.AddCell(SetHeaderCol(tableCell_0));

                tableCell_1 = new PdfPCell(new Phrase(lotNo, p7));
                tableCell_1.Colspan = 5;
                table.AddCell(SetInfoCol(tableCell_1));
 
                //row3
                tableCell_0 = new PdfPCell(new Phrase("Mfg. Date ", h7));
                table.AddCell(SetHeaderCol(tableCell_0));

                tableCell_1 = new PdfPCell(new Phrase(mfgDate, p7));
                tableCell_1.Colspan = 2;
                table.AddCell(SetInfoCol(tableCell_1));

                tableCell_2 = new PdfPCell(new Phrase("Exp. Date ", h7));
                table.AddCell(SetHeaderCol(tableCell_2));

                tableCell_3 = new PdfPCell(new Phrase(expDate, p7));
                tableCell_3.Colspan = 2;
                table.AddCell(SetInfoCol(tableCell_3));

            }
            else {
                //row 2
                tableCell_0 = new PdfPCell(new Phrase("Lot Vendor ", h7));
                table.AddCell(SetHeaderCol(tableCell_0));

                tableCell_1 = new PdfPCell(new Phrase(lotNo, p7));
                tableCell_1.Colspan = 2;
                table.AddCell(SetInfoCol(tableCell_1));

                tableCell_2 = new PdfPCell(new Phrase("Control no. ", h7));
                table.AddCell(SetHeaderCol(tableCell_2));

                tableCell_3 = new PdfPCell(new Phrase(controlNo, p7));
                tableCell_3.Colspan = 2;
                table.AddCell(SetInfoCol(tableCell_3));

                //row3
                tableCell_0 = new PdfPCell(new Phrase("Supplier ", h7));
                table.AddCell(SetHeaderCol(tableCell_0));

                tableCell_1 = new PdfPCell(new Phrase(supplier, p7));
                tableCell_1.Colspan = 5;
                table.AddCell(SetInfoCol(tableCell_1));

            }

            //row4
            tableCell_0 = new PdfPCell(new Phrase("Quantity ", h7));
            table.AddCell(SetHeaderCol(tableCell_0));

            tableCell_1 = new PdfPCell(new Phrase(qtyReceived, p7)); 
            tableCell_1.Colspan = 2;
            table.AddCell(SetInfoCol(tableCell_1));

            tableCell_2 = new PdfPCell(new Phrase("Unit ", h7));
            table.AddCell(SetHeaderCol(tableCell_2));

            tableCell_3 = new PdfPCell(new Phrase(unit, p7));
            tableCell_3.Colspan = 2;
            table.AddCell(SetInfoCol(tableCell_3));

            //row5
            tableCell_0 = new PdfPCell(new Phrase("Remark ", h7));
            table.AddCell(SetHeaderCol(tableCell_0));

            tableCell_1 = new PdfPCell(new Phrase(remark, p7));
            tableCell_1.Colspan = 3;
            table.AddCell(SetInfoCol(tableCell_1));

            tableCell_2 = new PdfPCell(new Phrase("No. ", h7));
            tableCell_2 = SetHeaderCol(tableCell_2);
            tableCell_2.HorizontalAlignment = Element.ALIGN_RIGHT;
            table.AddCell(tableCell_2);

            tableCell_3 = new PdfPCell(new Phrase(palletNo, p7));
            table.AddCell(SetInfoCol(tableCell_3));

           

            PdfPCell SetHeaderCol(PdfPCell pCell)
            {
                pCell.HorizontalAlignment = Element.ALIGN_LEFT;
                pCell.VerticalAlignment = Element.ALIGN_MIDDLE;
                pCell.Border = Rectangle.NO_BORDER;
                pCell.PaddingTop = 17f;
                return pCell;
            }
            PdfPCell SetInfoCol(PdfPCell pCell)
            {
                pCell.HorizontalAlignment = Element.ALIGN_LEFT;
                pCell.VerticalAlignment = Element.ALIGN_MIDDLE;
                pCell.Border = Rectangle.BOTTOM_BORDER;
                pCell.PaddingTop = 17f;
                pCell.PaddingBottom = 5f;
                return pCell;
            }
            return table;
        }
    }
}
