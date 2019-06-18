using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.Engine;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;

namespace ProjectTAP.Engine.Business.Crossdock
{
    public class GetIssueCrossdockDoc : BaseEngine<GetIssueCrossdockDoc.TReq, GetIssueCrossdockDoc.TRes>
    {
        public class TReq
        {
            public string packCode;
            public decimal quantity;
            public string lot;
            public DateTime productDate;
            public string options;
        }

        public class TRes
        {
            public List<Document> docs;
            public class Document
            {
                public amt_Document doc;
                public List<amt_Document> GRDocument = null;
            }
        }

        protected override TRes ExecuteEngine(TReq reqVO)
        {
            var pack = AWMSEngine.ADO.DataADO.GetInstant().SelectByCodeActive<ams_PackMaster>(reqVO.packCode, this.BuVO);

            if (pack == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Pack " + reqVO.packCode + " Not Found");

            var docItems = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_DocumentItem>(new SQLConditionCriteria[]{
                new SQLConditionCriteria("EventStatus", "10,11", SQLOperatorType.IN),
                new SQLConditionCriteria("PackMaster_ID", pack.ID.Value, SQLOperatorType.EQUALS),
                new SQLConditionCriteria("Lot", reqVO.lot, SQLOperatorType.EQUALS),
                new SQLConditionCriteria("BaseQuantity", reqVO.quantity, SQLOperatorType.MORE_EQUALS)
                }, this.BuVO);

            if (docItems == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Crossdock Document Not Found");

            var docs = AWMSEngine.ADO.DocumentADO.GetInstant().ListAndItem(docItems.Select(x => x.Document_ID).Distinct().ToList(), this.BuVO);
            var crosDocs = docs.Where(x => x.MovementType_ID == MovementType.FG_CROSSDOCK_CUS).ToList();
            
            var parentDocsID = crosDocs.Select(x => x.ParentDocument_ID.Value).Distinct().ToList();
            var docsList = AWMSEngine.ADO.DocumentADO.GetInstant().ListAndItem(parentDocsID, this.BuVO);

            var res = new TRes();

            docsList.ForEach(x =>
            {
                x.DocumentItems = x.DocumentItems.Where(doci => doci.PackMaster_ID == pack.ID).ToList();

                var resDoc = new TRes.Document();
                resDoc.doc = x;
                resDoc.GRDocument = crosDocs.Where(y => y.ParentDocument_ID == x.ID).ToList();

                res.docs.Add(resDoc);
            });

            return res;
        }
    }
}
