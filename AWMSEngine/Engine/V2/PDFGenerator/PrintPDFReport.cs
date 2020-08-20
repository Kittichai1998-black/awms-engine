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
    public class PrintPDFReport : BaseEngine<PDFContentCriteria, CreatePDFTemplate.TRes>
    {
        
        //public class TReq
        //{
        //    public int docID;
        //    public DocumentTypeID docTypeID;
        //}

        protected override CreatePDFTemplate.TRes ExecuteEngine(PDFContentCriteria reqVO)
        {
            //var reqGetDoc = new GetDocumentByID.TReq() {
            //    docID = reqVO.docID,
            //    docTypeID = reqVO.docTypeID,
            //    getMapSto = true
            //};
            //var resDocument = new GetDocumentByID().Execute(this.Logger, this.BuVO, reqGetDoc);

            //var cellHeader = new List<PDFContentCriteria.Table>();
            //var cellHader = new PDFContentCriteria.Table.Row.Cell() {
            //    text = "Putaway Document Report",
            //    style = "center"
            //};
            ////var rowsHeader = new List<>
            //cellHeader.Add(new PDFContentCriteria.Table()
            //{
            //    headers = new List<PDFContentCriteria.Table.Row>() { new PDFContentCriteria.Table.Row() { 
            //        cells = new List<PDFContentCriteria.Table.Row.Cell>() { cellHader } } 
            //    }
            //});
            //var header = new PDFContentCriteria.Head() {
            //    tables = cellHeader
            //};
            //var reqContent = new PDFContentCriteria() { 
            //    head = header
            //};



            var res = new CreatePDFTemplate().Execute(this.Logger, this.BuVO, reqVO);
            return res;
        }

    }

}
