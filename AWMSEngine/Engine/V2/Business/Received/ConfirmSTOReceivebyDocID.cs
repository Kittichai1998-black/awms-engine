using AMWUtil.Common;
using AMWUtil.Exception;
using AMSModel.Constant.EnumConst;
using AMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.Received
{
    public class ConfirmSTOReceivebyDocID : BaseEngine<ConfirmSTOReceivebyDocID.TReq, ConfirmSTOReceivebyDocID.TRes>
    {
        public class TReq
        {
            public long? docID;
        }
        public class TRes
        {
            public long? docID;
        }
        protected override TRes ExecuteEngine(TReq reqVO)
        {
            TRes res = new TRes();
            var docs = ADO.WMSDB.DocumentADO.GetInstant().GetDocumentAndDocItems(reqVO.docID.Value, BuVO);
            if (docs == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบข้อมูล Document");

            if (docs.DocumentType_ID == DocumentTypeID.PUTAWAY)
            {
                if (docs.EventStatus == DocumentEventStatus.NEW || docs.EventStatus == DocumentEventStatus.WORKING)
                {
                    var docitemsto = ADO.WMSDB.DocumentADO.GetInstant().ListItemAndDisto(reqVO.docID.Value, BuVO);
                    docitemsto.ForEach(item =>
                    {
                        if (item.EventStatus == DocumentEventStatus.NEW)
                        {
                            decimal sumQtyDisto = item.DocItemStos.Sum(z => z.BaseQuantity ?? 0);
                            decimal totalQty = item.BaseQuantity ?? 0;
                            if (sumQtyDisto != totalQty)
                                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "จำนวนสินค้าของรายการ SKU: " + item.Code + " ที่ต้องการรับเข้าไม่ตรงกับจำนวนที่ระบุในเอกสาร");

                            item.DocItemStos.ForEach(disto =>
                            {
                                var stosPack = ADO.WMSDB.StorageObjectADO.GetInstant().Get(disto.Sou_StorageObject_ID, StorageObjectType.PACK, false, false, BuVO);

                                ADO.WMSDB.StorageObjectADO.GetInstant().UpdateStatus(disto.Sou_StorageObject_ID, null, null, StorageObjectEventStatus.PACK_RECEIVED, BuVO);
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
                            });

                            if (item.DocItemStos.Any(x => x.Status == EntityStatus.ACTIVE || x.Status == EntityStatus.DONE))
                            {
                                item.EventStatus = DocumentEventStatus.WORKING;
                                ADO.WMSDB.DocumentADO.GetInstant().UpdateItemEventStatus(item.ID.Value, DocumentEventStatus.WORKING, this.BuVO);
                            }
                        }
                    });

                    /*void set_status_base(long parent_id, StorageObjectType parent_type)
                    {
                        if (parent_type != StorageObjectType.LOCATION)
                        {
                            var sto = ADO.WMSDB.StorageObjectADO.GetInstant().Get(parent_id, StorageObjectType.BASE, false, true, BuVO);
                            var stoLists = new List<StorageObjectCriteria>();
                            if (sto != null)
                                stoLists = sto.ToTreeList();
                            if (stoLists.Count() > 0 && stoLists.FindAll(x => x.parentID == parent_id && x.parentType == parent_type)
                                .TrueForAll(x => x.eventStatus == StorageObjectEventStatus.RECEIVED))
                            {
                                var parentUpdate = stoLists.Find(x => x.id == parent_id);
                                parentUpdate.eventStatus = StorageObjectEventStatus.ACTIVE;
                                ADO.WMSDB.StorageObjectADO.GetInstant().UpdateStatus(parentUpdate.id.Value, null, null, StorageObjectEventStatus.ACTIVE, this.BuVO);
                                if (parentUpdate.parentID.HasValue)
                                    set_status_base(parentUpdate.parentID.Value, parentUpdate.parentType.Value);
                            }
                        }
                    }*/
                    ADO.WMSDB.DocumentADO.GetInstant().UpdateEventStatus(reqVO.docID.Value, DocumentEventStatus.WORKING, this.BuVO);

                    var getGR = ADO.WMSDB.DocumentADO.GetInstant().GetDocumentAndDocItems(docs.ParentDocument_ID.Value, this.BuVO);

                    docitemsto.ForEach(item =>
                    {
                        var grItem = getGR.DocumentItems.Find(y => y.ID == item.ParentDocumentItem_ID);
                        if (item.EventStatus == DocumentEventStatus.WORKING)
                        {
                            grItem.EventStatus = DocumentEventStatus.WORKING;
                            ADO.WMSDB.DocumentADO.GetInstant().UpdateItemEventStatus(grItem.ID.Value, DocumentEventStatus.WORKING, this.BuVO);
                        }
                    });

                    ADO.WMSDB.DocumentADO.GetInstant().UpdateEventStatus(docs.ParentDocument_ID.Value, DocumentEventStatus.WORKING, this.BuVO);
                     
                }
            }
            else
            {
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่ใช่เอกสารรับเข้าไม่สามารถทำการปิดเอกสารได้");

            }
            res.docID = reqVO.docID.Value;
            return res;
        }

    }
}