using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business.Picking
{
    public class PickBaseSto_WorkedDoc :BaseEngine<
        PickBaseSto_WorkedDoc.TReq,
        PickBaseSto_WorkedDoc.TRes>
    {

        public class TReq
        {
            public long baseStoID;
        }
        public class TRes
        {
            public StorageObjectCriteria baseSto;
            public List<amt_Document> docs;
        }

        protected override TRes ExecuteEngine(TReq reqVO)
        {
            var bsto = ADO.StorageObjectADO.GetInstant().Get(reqVO.baseStoID, StorageObjectType.BASE, false, true, this.BuVO);
            if (bsto.eventStatus != StorageObjectEventStatus.PICKING)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Product not status PICKING!");

            var stoTree = bsto.ToTreeList();
            var docItems = ADO.DocumentADO.GetInstant().ListItemBySTO(
                stoTree.Where(x => x.type == StorageObjectType.PACK).Select(x => x.id.Value).ToList(), 
                DocumentTypeID.GOODS_ISSUED, this.BuVO)
                .FindAll(x => x.EventStatus != DocumentEventStatus.CLOSING && x.EventStatus != DocumentEventStatus.CLOSED);


            List<amt_DocumentItemStorageObject> distos = new List<amt_DocumentItemStorageObject>();

            //Set DISTO ให้ทั้ง DocItem
            docItems.ForEach(doci =>
            {
                doci.DocItemStos = ADO.DocumentADO.GetInstant().GetItemAndStoInDocItem(doci.ID.Value, this.BuVO).DocItemStos;
                distos.AddRange(doci.DocItemStos);
            });

            //Picked โดยการ Update Active DISTO ที่จอง
            //Pciked โดยการ Update STO ทั้งหมดที่ถูกจอง
            foreach(var disto in distos.Where(x=>x.Status == EntityStatus.INACTIVE))
            {
                var pstoPick = stoTree.FirstOrDefault(x => x.id == disto.Sou_StorageObject_ID);
                if (pstoPick != null)
                {

                    disto.Status = EntityStatus.ACTIVE;
                    ADO.DocumentADO.GetInstant().UpdateMappingSTO(disto.ID.Value, EntityStatus.ACTIVE, this.BuVO);

                    var unitConvert = StaticValue.ConvertToNewUnitBySKU(
                                                        pstoPick.skuID.Value,
                                                        disto.BaseQuantity.Value,
                                                        disto.BaseUnitType_ID,
                                                        pstoPick.unitID);
                    pstoPick.qty -= unitConvert.newQty;
                    pstoPick.baseQty -= disto.BaseQuantity.Value;
                    if (pstoPick.baseQty <= 0)
                        pstoPick.eventStatus = StorageObjectEventStatus.PICKED;
                    ADO.StorageObjectADO.GetInstant().PutV2(pstoPick, this.BuVO);
                }
            }

            //Update DocItem status WORKED เมื่อ DISTO ทั้งหมดถูก PICK
            docItems.ForEach(doci =>
            {
                if (doci.DocItemStos.TrueForAll(x => x.Status == EntityStatus.ACTIVE))
                {
                    doci.EventStatus = DocumentEventStatus.WORKED;
                    doci.Status = ADO.DocumentADO.GetInstant().UpdateItemEventStatus(doci.ID.Value, DocumentEventStatus.WORKED, this.BuVO);
                }
                else if (doci.EventStatus == DocumentEventStatus.NEW)
                {
                    doci.EventStatus = DocumentEventStatus.WORKING;
                    doci.Status = ADO.DocumentADO.GetInstant().UpdateItemEventStatus(doci.ID.Value, DocumentEventStatus.WORKING, this.BuVO);
                }
            });
            
            //Update Base เป็น PICKED เมื่อสินค้าได้ถูก PICKED หมดแล้ว
            if(stoTree.FindAll(x=>x.type == StorageObjectType.PACK).TrueForAll(x=>x.eventStatus == StorageObjectEventStatus.PICKED))
            {
                bsto.eventStatus = StorageObjectEventStatus.PICKED;
                ADO.StorageObjectADO.GetInstant().PutV2(bsto, this.BuVO);
            }

            var docs = ADO.DocumentADO.GetInstant().List(docItems.Select(x => x.Document_ID).Distinct().ToList(), this.BuVO);
            docs.ForEach(doc => {
                doc.DocumentItems = ADO.DocumentADO.GetInstant().ListItem(doc.ID.Value, this.BuVO);
                if(doc.DocumentItems.TrueForAll(x=>x.EventStatus == DocumentEventStatus.WORKED))
                {
                    doc.EventStatus = DocumentEventStatus.WORKED;
                    doc.Status = ADO.DocumentADO.GetInstant().UpdateEventStatus(doc.ID.Value, DocumentEventStatus.WORKED, this.BuVO);
                }
            });

            return new TRes()
            {
                baseSto = bsto,
                docs = docs
            };
        }

    }
}
