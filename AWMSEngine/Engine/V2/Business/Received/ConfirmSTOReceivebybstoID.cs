using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.Received
{
    public class ConfirmSTOReceivebybstoID : BaseEngine<ConfirmSTOReceivebybstoID.TReq, ConfirmSTOReceivebybstoID.TRes>
    {
        public class TReq
        {
            public long? bstoID;
        }
        public class TRes
        {
            public long? docID;
        }
        protected override TRes ExecuteEngine(TReq reqVO)
        {
            TRes res = new TRes();

            var stosPack = ADO.WMSDB.StorageObjectADO.GetInstant().Get(reqVO.bstoID.Value, StorageObjectType.BASE, false, true, BuVO);
            var pack = stosPack.mapstos.FirstOrDefault().id;

            var disto = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(
                new KeyValuePair<string, object>[] {
                        new KeyValuePair<string,object>("Sou_StorageObject_ID",pack),
                }, this.BuVO).FirstOrDefault();


            var docID = ADO.WMSDB.DataADO.GetInstant().SelectByID<amt_DocumentItem>(disto.DocumentItem_ID, this.BuVO).Document_ID;
            var docItemID = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_DocumentItem>(
                      new KeyValuePair<string, object>[] {
                        new KeyValuePair<string,object>("Document_ID",docID),
                      }, this.BuVO);
            var statusDocID = ADO.WMSDB.DataADO.GetInstant().SelectByID<amt_Document>(docID, this.BuVO).Status;

            if (statusDocID != EntityStatus.ACTIVE)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบข้อมูล Document");

            var docs = ADO.WMSDB.DocumentADO.GetInstant().GetDocumentAndDocItems(docID, BuVO);
            if (docs == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบข้อมูล Document");

            var docItem = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_DocumentItem>(
                     new KeyValuePair<string, object>[] {
                        new KeyValuePair<string,object>("Document_ID",docs.ID.Value),
                     }, this.BuVO);


            ADO.WMSDB.StorageObjectADO.GetInstant().UpdateStatus(disto.Sou_StorageObject_ID, null, null, StorageObjectEventStatus.RECEIVED, BuVO);
            //update Audit status, Hold status

            //set_status_base(stosPack.parentID.Value, stosPack.parentType.Value);
            disto.Status = EntityStatus.ACTIVE;
            ADO.WMSDB.DistoADO.GetInstant().Update(disto.ID.Value, EntityStatus.ACTIVE, BuVO);
            //ถ้าไม่มี des_waveseq สุดท้ายเเล้ว ให้อัพเดท disto เป็น Done
            if (disto.Des_WaveSeq_ID == null)
            {
                disto.Status = EntityStatus.DONE;
                ADO.WMSDB.DistoADO.GetInstant().Update(disto.ID.Value, EntityStatus.DONE, this.BuVO);
            }


            //if (item.DocItemStos.Any(x => x.Status == EntityStatus.ACTIVE || x.Status == EntityStatus.DONE))
            //{
            //    item.EventStatus = DocumentEventStatus.WORKING;
            //    ADO.WMSDB.DocumentADO.GetInstant().UpdateItemEventStatus(item.ID.Value, DocumentEventStatus.WORKING, this.BuVO);
            //}




            ADO.WMSDB.DocumentADO.GetInstant().UpdateEventStatus(docID, DocumentEventStatus.WORKING, this.BuVO);

            var getGR = ADO.WMSDB.DocumentADO.GetInstant().GetDocumentAndDocItems(docs.ParentDocument_ID.Value, this.BuVO);

            docItem.ForEach(item =>
            {
                var grItem = getGR.DocumentItems.Find(y => y.ID == item.ParentDocumentItem_ID);
                if (item.EventStatus == DocumentEventStatus.WORKING)
                {
                    grItem.EventStatus = DocumentEventStatus.WORKING;
                    ADO.WMSDB.DocumentADO.GetInstant().UpdateItemEventStatus(grItem.ID.Value, DocumentEventStatus.WORKING, this.BuVO);
                }
            });

            ADO.WMSDB.DocumentADO.GetInstant().UpdateEventStatus(docs.ParentDocument_ID.Value, DocumentEventStatus.WORKING, this.BuVO);


            res.docID = docID;
            return res;
        }

    }
}