using AMWUtil.Exception;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business.Consolidate
{
    public class CheckBSTOCanUseInDocument : BaseEngine<CheckBSTOCanUseInDocument.TReq, ams_BaseMaster>
    {
        public class TReq
        {
            public string baseCode;
            public long? docID;
            public DocumentTypeID? docType;
            public long? desCustomerID;
        }
        protected override ams_BaseMaster ExecuteEngine(TReq reqVO)
        {
            if (!reqVO.docID.HasValue && (!reqVO.docType.HasValue || !reqVO.desCustomerID.HasValue))
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "docID , docType , desCustomerID");

            var res = reqVO.docID.HasValue ?
                ADO.StorageObjectADO.GetInstant().MatchDocLock(reqVO.baseCode, reqVO.docID, this.BuVO) :
                ADO.StorageObjectADO.GetInstant().MatchDocLock(reqVO.baseCode, reqVO.docType, reqVO.desCustomerID, this.BuVO);

            if (res == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V3002, "ไม่สามารถใช้ " + reqVO.baseCode + " ได้");


            return res;
        }
    }
}
