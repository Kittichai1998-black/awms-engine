using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Exception;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Entity;

namespace AWMSEngine.Engine.Business.Received
{
    public class UpdateEvenStatus : BaseEngine<UpdateEvenStatus.TReq, UpdateEvenStatus.TRes>
    {

        public class TReq 
        {
            public long idDoc;
            public int docType;
            public DocumentEventStatus eventStatusNew;
       
        }
        public class TRes
        {
            public long idDoc;
            public int docType;
            public DocumentEventStatus eventStatusNew;
            public DocumentEventStatus eventStatusOld;
        }
        protected override TRes ExecuteEngine(TReq reqVO)
        {
            var alm = ADO.DataADO.GetInstant().SelectBy<amt_Document>(
                new KeyValuePair<string, object>[] {
                    new KeyValuePair<string,object>("ID",reqVO.idDoc),
                    new KeyValuePair<string,object>("DocumentType_ID",reqVO.docType),
                    new KeyValuePair<string,object>("Status", EntityStatus.ACTIVE)
                }, this.BuVO).FirstOrDefault();


            if (alm == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบ เอกสาร'" + reqVO.idDoc + "'");

            ADO.DocumentADO.GetInstant().UpdateStatusToChild(reqVO.idDoc,
                null, EntityStatus.ACTIVE,
                reqVO.eventStatusNew,
                this.BuVO);

            var response = new TRes()
            {
                idDoc = reqVO.idDoc,
                docType = reqVO.docType,
                eventStatusNew = reqVO.eventStatusNew,
                eventStatusOld = alm.EventStatus

            };
            return response;
        }
    }
}
