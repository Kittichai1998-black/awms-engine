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

            var stosPack = ADO.StorageObjectADO.GetInstant().Get(reqVO.bstoID.Value, StorageObjectType.BASE, false, true, BuVO);
            var pack = stosPack.mapstos.FirstOrDefault().id;

            var disto = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(
                new KeyValuePair<string, object>[] {
                        new KeyValuePair<string,object>("Sou_StorageObject_ID",pack),                       
                }, this.BuVO).FirstOrDefault();

            var docID = ADO.DataADO.GetInstant().SelectByID<amt_DocumentItem>(disto.DocumentItem_ID, this.BuVO).Document_ID;

            var docs = ADO.DocumentADO.GetInstant().GetDocumentAndDocItems(docID, BuVO);
            if (docs == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบข้อมูล Document");

            if (docs.DocumentType_ID == DocumentTypeID.PUTAWAY)
            {
                if (docs.EventStatus == DocumentEventStatus.NEW)
                {
                    var docitemsto = ADO.DocumentADO.GetInstant().ListItemAndDisto(docID, BuVO);
                    docitemsto.ForEach(item =>
                    {
                        //decimal sumQtyDisto = item.DocItemStos.Sum(z => z.BaseQuantity ?? 0);
                        //decimal totalQty = item.BaseQuantity ?? 0;
                        //if (sumQtyDisto != totalQty)
                        //    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "จำนวนสินค้าของรายการ SKU: " + item.Code + " ที่ต้องการรับเข้าไม่ตรงกับจำนวนที่ระบุในเอกสาร");

                        item.DocItemStos.ForEach(disto =>
                        {


                            ADO.StorageObjectADO.GetInstant().UpdateStatus(disto.Sou_StorageObject_ID, null, null, StorageObjectEventStatus.RECEIVED, BuVO);
                            //update Audit status, Hold status

                            //set_status_base(stosPack.parentID.Value, stosPack.parentType.Value);
                            disto.Status = EntityStatus.ACTIVE;
                            ADO.DistoADO.GetInstant().Update(disto.ID.Value, EntityStatus.ACTIVE, BuVO);
                            //ถ้าไม่มี des_waveseq สุดท้ายเเล้ว ให้อัพเดท disto เป็น Done
                            if (disto.Des_WaveSeq_ID == null)
                            {
                                disto.Status = EntityStatus.DONE;
                                ADO.DistoADO.GetInstant().Update(disto.ID.Value, EntityStatus.DONE, this.BuVO);
                            }
                        });

                        if (item.DocItemStos.Any(x => x.Status == EntityStatus.ACTIVE || x.Status == EntityStatus.DONE))
                        {
                            ADO.DocumentADO.GetInstant().UpdateItemEventStatus(item.ID.Value, DocumentEventStatus.WORKING, this.BuVO);
                        }

                    });


                    ADO.DocumentADO.GetInstant().UpdateEventStatus(docID, DocumentEventStatus.WORKING, this.BuVO);

                    var getGR = ADO.DocumentADO.GetInstant().GetDocumentAndDocItems(docs.ParentDocument_ID.Value, this.BuVO);

                    docs.DocumentItems.ForEach(item =>
                    {
                        var grItem = getGR.DocumentItems.Find(y => y.ID == item.ParentDocumentItem_ID);
                        grItem.EventStatus = DocumentEventStatus.WORKING;
                        ADO.DocumentADO.GetInstant().UpdateItemEventStatus(grItem.ID.Value, DocumentEventStatus.WORKING, this.BuVO);
                    });

                    ADO.DocumentADO.GetInstant().UpdateEventStatus(docs.ParentDocument_ID.Value, DocumentEventStatus.WORKING, this.BuVO);

                }
            }
            else
            {
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่ใช่เอกสารรับเข้าไม่สามารถทำการปิดเอกสารได้");

            }
            res.docID = docID;
            return res;
        }

    }
}