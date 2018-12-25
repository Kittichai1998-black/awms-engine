using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business.Received
{
    public class ClosingGRDocSAP : BaseEngine<ClosingGRDocSAP.TDocReq, SAPInterfaceReturnvalues>
    {
        public class TDocReq
        {
            public long[] docIDs;
        }
        public class TDocRes
        {
            public SAPInterfaceReturnvalues dataSAP;
        }

        protected override SAPInterfaceReturnvalues ExecuteEngine(TDocReq reqVO)
        {
            foreach (var num in reqVO.docIDs)
            {
                var doc = ADO.DataADO.GetInstant().SelectByID<amv_Document>(num, this.BuVO);


                if (doc == null || doc.Status == EntityStatus.REMOVE)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "DocumnetID " + doc.ID);


                if (doc.EventStatus != DocumentEventStatus.WORKING && doc.EventStatus != DocumentEventStatus.WORKED)
                {
                    throw new AMWException(this.Logger, AMWExceptionCode.V1002, "เอกสารไม่อยู่ในสถานะ WORKING และ WORKED ไม่สามารถ Close เอกสารได้ ");
                }

                var docItem = ADO.DataADO.GetInstant().SelectBy<amv_DocumentItem>(new KeyValuePair<string, object>[] {
                    new KeyValuePair<string, object> ("Document_ID",num)
                }, this.BuVO);


                ADO.DocumentADO.GetInstant().UpdateStatusToChild(doc.ID.Value,
                null, null,
                DocumentEventStatus.CLOSING,
                this.BuVO);
            }
            return null;
        }
    }
}