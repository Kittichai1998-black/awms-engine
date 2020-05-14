using AWMSEngine.ADO.StaticValue;
using AWMSModel.Entity;
using iTextSharp.text;
using iTextSharp.text.pdf;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.PDFGenerator
{
    public class PDFCreateTest : BaseEngine<PDFCreateTest.TReq, CreatePDFTemplate.TRes>
    {

        public class TReq
        {
            public string formCode;
            public string spName;
        }

        public class DataReport
        {
            public string TitleTable;
            public List<ams_AreaMaster> AreaMasterData;
            public string TitleTable2;
        }

        protected override CreatePDFTemplate.TRes ExecuteEngine(TReq reqVO)
        {
            try 
            {
                var dataTable = StaticValueManager.GetInstant().AreaMasters;
                var param = new DataReport
                {
                    TitleTable = "Area",
                    AreaMasterData = dataTable,
                    TitleTable2 = "Footer"

                };

                var pdf = new CreatePDFTemplate();
                var filePDF = pdf.createPDF(reqVO.formCode, param);

                return filePDF;
            } 
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }

            
        }
    }
}
