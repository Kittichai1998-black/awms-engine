using AMWUtil.Exception;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business
{
    public class ClosingDocument : BaseEngine<ClosingDocument.TDocReq, ClosingDocument.TDocRes>
    {
        public class TDocReq
        {
            public long[] docIDs;
        }
        public class TDocRes
        {
            dynamic res;
        }
        //เช็คสถานะเอกสารว่าพร้อม close และ disto พร้อม close
        protected override TDocRes ExecuteEngine(TDocReq reqVO)
        {
            TDocRes res = new TDocRes();
            foreach (var num in reqVO.docIDs)
            {
                var doc = ADO.DataADO.GetInstant().SelectByID<amv_Document>(num, this.BuVO);

                if (doc == null || doc.Status == EntityStatus.REMOVE)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Documnet " + doc.Code + "Status : REMOVE");

                var docDisto = ADO.DocumentADO.GetInstant().ListItemAndDisto(num, this.BuVO);

                if (doc.EventStatus != DocumentEventStatus.WORKED && doc.EventStatus != DocumentEventStatus.CLOSING && doc.EventStatus != DocumentEventStatus.CLOSED)
                {
                    throw new AMWException(this.Logger, AMWExceptionCode.V1002, "เอกสารไม่อยู่ในสถานะ WORKED ไม่สามารถ Close เอกสารได้ ");
                }

                var docItem = ADO.DataADO.GetInstant().SelectBy<amv_DocumentItem>(new KeyValuePair<string, object>[] {
                    new KeyValuePair<string, object> ("Document_ID",num)
                    }, this.BuVO);

                ADO.DocumentADO.GetInstant().UpdateStatusToChild(doc.ID.Value,
                null, null,
                DocumentEventStatus.CLOSING,
                this.BuVO);


            }
            return res;
        }
    }
}
