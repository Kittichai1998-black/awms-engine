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
using AWMSModel.Criteria;
using AWMSEngine.Engine.V2.Business.Document;
using AWMSModel.Constant.EnumConst;

namespace AWMSEngine.Engine.V2.PDFGenerator
{
    public class PrintPDFReport : BaseEngine<PrintPDFReport.TReq, CreatePDFTemplate.TRes>
    {
        
        public class TReq
        {
            public int docID;
            public DocumentTypeID docTypeID;
        }

        protected override CreatePDFTemplate.TRes ExecuteEngine(TReq reqVO)
        {
            var reqGetDoc = new GetDocumentByID.TReq() {
                docID = reqVO.docID,
                docTypeID = reqVO.docTypeID,
                getMapSto = true
            };
            var resDocument = new GetDocumentByID().Execute(this.Logger, this.BuVO, reqGetDoc);
             

            var reqContent = new PDFContentCriteria();



            var res = new CreatePDFTemplate().Execute(this.Logger, this.BuVO, reqContent);
            return res;
        }

    }

}
