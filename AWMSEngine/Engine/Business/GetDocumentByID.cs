using AMWUtil.Exception;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business
{
    public class GetDocumentByID : BaseEngine<GetDocumentByID.TReq,GetDocumentByID.TRes>
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
            public List<StorageObjectCriteria> mapstos;
        }

        protected override TRes ExecuteEngine(TReq reqVO)
        {
            TRes res = new TRes();
            var doc = ADO.DataADO.GetInstant().SelectBy<TRes.ViewDocument>("amv_Document", "*", "",
                new SQLConditionCriteria[] {
                    new SQLConditionCriteria("ID", reqVO.docID, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("DocumentType_ID", reqVO.docTypeID, SQLOperatorType.EQUALS)
                },
                new SQLOrderByCriteria[] { },
                null,null,this.BuVO).FirstOrDefault();
            if (doc == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V2001, "Document");
            var docItems = ADO.DataADO.GetInstant().SelectBy<amv_DocumentItem>(
                new KeyValuePair<string, object>[] {
                    new KeyValuePair<string, object>("Document_ID",doc.ID),
                    new KeyValuePair<string, object>("Status",EntityStatus.ACTIVE)
                }, 
                this.BuVO);
            doc.documentItems = docItems;
            res.document = doc;

            /*--------------------------*/
            if (reqVO.getMapSto)
                res.mapstos = ADO.StorageObjectADO.GetInstant().ListInDoc(doc.ID, null, DocumentTypeID.LOADING, this.BuVO);


            return res;
        }
    }
}
