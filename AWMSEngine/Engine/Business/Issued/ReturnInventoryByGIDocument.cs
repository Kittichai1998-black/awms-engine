using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business.Issued
{
    public class ReturnInventoryByGIDocument : BaseEngine<ReturnInventoryByGIDocument.TReq, StorageObjectCriteria>
    {
        public class TReq
        {
            public long baseID;
            public long docItemID;
            public string packCode;
            public string batch;
            public string lot;
            public string orderNo;
            public decimal baseQty;
        }

        protected override StorageObjectCriteria ExecuteEngine(TReq reqVO)
        {
            var baseInfo = ADO.StorageObjectADO.GetInstant().Get(reqVO.baseID, StorageObjectType.BASE, false, true, this.BuVO);
            var baseTree = baseInfo.ToTreeList();
            if (baseTree.Any(x => x.type == StorageObjectType.PACK) &&
                !baseTree.FindAll(x => x.type == StorageObjectType.PACK)
                    .TrueForAll(x => x.batch == reqVO.batch && x.lot == reqVO.lot && x.orderNo == reqVO.orderNo))
            {
                throw new AMWException(this.Logger, AMWExceptionCode.V2002, "สินค้าใน Pallet มี Batch, Lot หรือ Order No ไม่ตรงกับสินค้าที่จะรับคืน");
            }

            var docItem = ADO.DocumentADO.GetInstant().GetItemAndStoInDocItem(reqVO.docItemID, this.BuVO);
            List<StorageObjectCriteria> mapstoCanReturns = new List<StorageObjectCriteria>();
            docItem.DocItemStos.ForEach(x => {
                var sto = ADO.StorageObjectADO.GetInstant().Get(x.StorageObject_ID, StorageObjectType.PACK, false, false, this.BuVO);
                if(sto.code == reqVO.packCode && sto.batch == reqVO.batch && sto.lot == reqVO.lot && sto.orderNo == reqVO.orderNo)
                {
                    mapstoCanReturns.Add(sto);
                }
            });
            
            if (reqVO.baseQty <= docItem.DocItemStos
                                        .Where(x=> mapstoCanReturns.Any(y=>y.id== x.StorageObject_ID))
                                        .Sum(x=>x.BaseQuantity))
            {
                StorageObjectCriteria newSto = mapstoCanReturns.First().Clone();
                newSto.id = null;
                newSto.baseQty = reqVO.baseQty;
                var converUnit = StaticValue.ConvertToNewUnitBySKU(newSto.skuID.Value, reqVO.baseQty, newSto.baseUnitID, newSto.unitID);
                newSto.qty = converUnit.qty;
                newSto.weiKG = (newSto.weiKG / newSto.baseQty) * reqVO.baseQty;
                newSto.eventStatus = StorageObjectEventStatus.RECEIVED;
                newSto.parentID = baseInfo.id;
                newSto.parentType = StorageObjectType.BASE;

                if(baseInfo.eventStatus == StorageObjectEventStatus.IDLE)
                {
                    baseInfo.eventStatus = StorageObjectEventStatus.RECEIVED;
                    ADO.StorageObjectADO.GetInstant().PutV2(baseInfo, this.BuVO);
                }
                ADO.StorageObjectADO.GetInstant().PutV2(newSto, this.BuVO);
                baseInfo.mapstos.Add(newSto);

                ADO.DocumentADO.GetInstant().MappingSTO(new amt_DocumentItemStorageObject()
                {
                    DocumentItem_ID = docItem.ID.Value,
                    StorageObject_ID = newSto.id.Value,
                    Quantity = -newSto.qty,
                    UnitType_ID = newSto.unitID,
                    BaseUnitType_ID = newSto.baseUnitID,
                    BaseQuantity = -newSto.baseQty,
                    Status = EntityStatus.ACTIVE,
                }, this.BuVO);
            }else
            {
                throw new AMWException(this.Logger, AMWExceptionCode.V2002, "ไม่สามารถรับคืนสินค้าได้ เนื่องจาก จำนวนที่เหลือจากที่เบิกไม่สอดคล้องกัน");
            }
            return baseInfo;
            //ADO.DocumentADO.GetInstant().ListItemAndStoInDoc
        }


    }
}
