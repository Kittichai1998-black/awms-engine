using AWMSEngine.ADO.StaticValue;
using AWMSEngine.Engine.V2.General;
using AWMSModel.Entity;
using DinkToPdf;
using DinkToPdf.Contracts;
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
    public class PDFCreator : BaseEngine<PDFCreator.TReq, PDFCreator.TRes>
    {
       
        public class TReq
        {
            public string formCode;
            public string spName;
        }

        public class TRes
        {
            public byte[] stream;
            public string contentType;
            public string fileName;
        }

        public class DataReport
        {
            public string TitleTable;
            public List<ams_AreaMaster> AreaMasterData;
            public string TitleTable2;
        }
        protected override TRes ExecuteEngine(TReq reqVO)
        {
            TRes res = new TRes();
            var converter = new SynchronizedConverter(new PdfTools());
            try
            {
                //string fileName = @"D:\PDFConvert\Employee_Report2.pdf";
                //Directory.CreateDirectory(Path.GetDirectoryName(fileName));
                var dataTable = StaticValueManager.GetInstant().AreaMasters;
                var param = new DataReport
                {
                    TitleTable = "Area",
                    AreaMasterData = dataTable,
                    TitleTable2 = "Footer"

                };
                var pdf = new CreateHTMLContent();
                var html = pdf.createHtmlToPdfDocument(reqVO.formCode, param);

                //เเปลงเป็น pdf
                res.stream = converter.Convert(html);
                res.contentType = "application/pdf";
                res.fileName = reqVO.formCode+".pdf";

            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }

            return res;
        }
 
    }
}
