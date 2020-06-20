using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business
{
    public class ConfirmMappingSTOandDiSTO : BaseEngine<ConfirmMappingSTOandDiSTO.TReq, ConfirmMappingSTOandDiSTO.TRes>
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
            var docs = ADO.DocumentADO.GetInstant().Get(reqVO.docID.Value, BuVO);
            if (docs == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบข้อมูล Document");

            if (docs.DocumentType_ID == DocumentTypeID.GOODS_RECEIVED)
            {
                if (docs.EventStatus == DocumentEventStatus.NEW)
                {
                    var docitemsto = ADO.DocumentADO.GetInstant().ListItemAndDisto(reqVO.docID.Value, BuVO);
                    docitemsto.ForEach(item =>
                    {
                        decimal sumQtyDisto = item.DocItemStos.Sum(z => z.BaseQuantity ?? 0);
                        decimal totalQty = item.BaseQuantity ?? 0;
                        if (sumQtyDisto != totalQty)
                            throw new AMWException(this.Logger, AMWExceptionCode.V1001, "จำนวนสินค้าของรายการ SKU: " + item.Code + " ที่ต้องการรับเข้าไม่ตรงกับจำนวนที่ระบุในเอกสาร");

                        item.DocItemStos.ForEach(disto =>
                        {
                            var stosPack = ADO.StorageObjectADO.GetInstant().Get(disto.Sou_StorageObject_ID, StorageObjectType.PACK, false, false, BuVO);

                            ADO.StorageObjectADO.GetInstant().UpdateStatus(disto.Sou_StorageObject_ID, null, null, StorageObjectEventStatus.RECEIVING, BuVO);

                            set_status_base(stosPack.parentID.Value, stosPack.parentType.Value);

                            ADO.DocumentADO.GetInstant().UpdateMappingSTO(disto.ID.Value, EntityStatus.ACTIVE, BuVO);
                        });
                    });


                    void set_status_base(long parent_id, StorageObjectType parent_type)
                    {
                        if (parent_type != StorageObjectType.LOCATION)
                        {
                            var sto = ADO.StorageObjectADO.GetInstant().Get(parent_id, StorageObjectType.BASE, false, true, BuVO);
                            var stoLists = new List<StorageObjectCriteria>();
                            if (sto != null)
                                stoLists = sto.ToTreeList();
                            var gety = stoLists.FindAll(x => x.parentID == parent_id && x.parentType == parent_type);
                            if (stoLists.Count() > 0 && stoLists.FindAll(x => x.parentID == parent_id && x.parentType == parent_type)
                                .TrueForAll(x => x.eventStatus == StorageObjectEventStatus.RECEIVING))
                            {
                                var parentUpdate = stoLists.Find(x => x.id == parent_id);
                                parentUpdate.eventStatus = StorageObjectEventStatus.ACTIVE;
                                ADO.StorageObjectADO.GetInstant().UpdateStatus(parentUpdate.id.Value, null, null, StorageObjectEventStatus.ACTIVE, this.BuVO);
                                if (parentUpdate.parentID.HasValue)
                                    set_status_base(parentUpdate.parentID.Value, parentUpdate.parentType.Value);
                            }
                        }
                    }
                    ADO.DocumentADO.GetInstant().UpdateStatusToChild(reqVO.docID.Value, null, null, DocumentEventStatus.WORKING, BuVO);

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