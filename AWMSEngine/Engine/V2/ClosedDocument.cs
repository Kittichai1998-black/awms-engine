using AMWUtil.Exception;
using AWMSEngine.ADO.StaticValue;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business
{
    public class ClosedDocument : BaseEngine<ClosedDocument.TDocReq, ClosedDocument.TDocRes>
    {
        public class TDocReq
        {
            public long[] docIDs;
            public StorageObjectEventStatus stoEvtStatus = StorageObjectEventStatus.RECEIVED;
        }
        public class TDocRes
        {
            public dynamic sapDatas;
        }
        protected override TDocRes ExecuteEngine(TDocReq reqVO)
        {
            foreach (var docID in reqVO.docIDs)
            {
                var doc = ADO.DataADO.GetInstant().SelectByID<amt_Document>(docID, this.BuVO);

                if (doc == null || doc.Status == EntityStatus.REMOVE)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "DocumnetID " + docID + " Not Found or Status : REMOVE");

                if (doc.EventStatus != DocumentEventStatus.CLOSING)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1002, "The document status is not WORKED, Cannot close the document");
            }
            foreach (var docID in reqVO.docIDs)
            {
                var doc = ADO.DataADO.GetInstant().SelectByID<amt_Document>(docID, this.BuVO);
                if (StaticValueManager.GetInstant().IsFeature(FeatureCode.SendERPAPIOnClosed_1001_311))
                {

                }
            }
            return null;
        }
    }
}
