using AMWUtil.Exception;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Criteria.SP.Response;
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
            public List<SPOutSTORootCanUseCriteria> bstos;
        }

        protected override TRes ExecuteEngine(TReq reqVO)
        {
            TRes res = new TRes();
            var doc = ADO.DataADO.GetInstant().SelectBy<TRes.ViewDocument>("amv_Document", "*", null,
                new SQLConditionCriteria[]
                {
                    new SQLConditionCriteria("ID", reqVO.docID, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("DocumentType_ID", reqVO.docTypeID, SQLOperatorType.EQUALS)
                },
                new SQLOrderByCriteria[] { }, null, null,
                this.BuVO).FirstOrDefault();
            if (doc == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V2001, "ไม่พบเอกสารในระบบ");
            var docItems = ADO.DataADO.GetInstant().SelectBy<amv_DocumentItem>(
                new SQLConditionCriteria[]
                {
                    new SQLConditionCriteria("Document_ID",doc.ID, SQLOperatorType.EQUALS),
                    //new SQLConditionCriteria("Status",EntityStatus.REMOVE, SQLOperatorType.NOTEQUALS),
                },
                this.BuVO);
            doc.documentItems = docItems;
            res.document = doc;

            /*--------------------------*/
            if (reqVO.getMapSto && doc.documentItems.Count != 0)
            {
                res.bstos = ADO.StorageObjectADO.GetInstant().ListBaseInDoc(doc.ID, null, null, this.BuVO);
                
                /*res.bstos.ForEach(bs =>
                {
                    var di = doc.documentItems.FirstOrDefault(x => x.ID == bs.docItemID);
                    if(bs.packUnitID != di.UnitType_ID)
                    {
                        var newUnit = this.StaticValue.ConvertToNewUnitBySKU(di.SKUMaster_ID.Value, bs.distoQty, bs.distoUnitID, di.UnitType_ID.Value);
                        
                        bs.packQty = newUnit.qty;
                        bs.packUnitID = newUnit.unitType_ID;
                        bs.packUnitCode = this.StaticValue.UnitTypes.First(x => x.ID == newUnit.unitType_ID).Code;
                        
                    }
                });*/
            }


            return res;
        }
    }
}
