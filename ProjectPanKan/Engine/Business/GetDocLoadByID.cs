using AMWUtil.Exception;
using AWMSEngine.Engine;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Criteria.SP.Response;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectPanKan.Engine.Business
{
    public class GetDocLoadByID : BaseEngine<GetDocLoadByID.TReq,GetDocLoadByID.TRes>
    {

        public class TReq
    {
        public int docID;
        public bool getMapSto;
        public DocumentTypeID docTypeID;
    }
    public class TRes
    {
        public ViewDocument document;
        public class ViewDocument : amv_Document
        {
            public List<amv_DocumentItem> documentItems;
        }
        public List<SPOutSTORootCanUseCriteria> bstos;
    }

    protected override TRes ExecuteEngine(TReq reqVO)
    {
        TRes res = new TRes();
        var doc = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<TRes.ViewDocument>("amv_Document", "*", null,
            new SQLConditionCriteria[]
            {
                    new SQLConditionCriteria("ID", reqVO.docID, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("DocumentType_ID", reqVO.docTypeID, SQLOperatorType.EQUALS)
            },
            new SQLOrderByCriteria[] { }, null, null,
            this.BuVO).FirstOrDefault();
        
            if (doc == null)
            throw new AMWException(this.Logger, AMWExceptionCode.V2001, "ไม่พบเอกสารในระบบ");

        var docItems = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amv_DocumentItem>(
            new SQLConditionCriteria[]
            {
                    new SQLConditionCriteria("Document_ID",doc.ID, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("Status",EntityStatus.REMOVE, SQLOperatorType.NOTEQUALS),
            },
            this.BuVO);
        doc.documentItems = docItems;
        res.document = doc;

        /*--------------------------*/
        if (reqVO.getMapSto)
            res.bstos = AWMSEngine.ADO.StorageObjectADO.GetInstant().ListBaseInDoc(doc.ID, null, null, this.BuVO);


        return res;
    }
}
}
