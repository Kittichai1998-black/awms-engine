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
                    .TrueForAll(x => x.code==reqVO.packCode && x.batch == reqVO.batch && x.lot == reqVO.lot && x.orderNo == reqVO.orderNo))
            {
                throw new AMWException(this.Logger, AMWExceptionCode.V2002, "สินค้าใน Pallet มี Batch, Lot หรือ Order No ไม่ตรงกับสินค้าที่จะรับคืน");
            }

            var docItem = ADO.DocumentADO.GetInstant().GetItemAndStoInDocItem(reqVO.docItemID, this.BuVO);
            List<amt_StorageObject> mapstoCanReturns = new List<amt_StorageObject>();
            docItem.DocItemStos.ForEach(x => {
                var sto = ADO.DataADO.GetInstant().SelectByID<amt_StorageObject>(x.Sou_StorageObject_ID, this.BuVO);
                if(sto.Code == reqVO.packCode && sto.Batch == reqVO.batch && sto.Lot == reqVO.lot && sto.OrderNo == reqVO.orderNo)
                {
                    mapstoCanReturns.Add(sto);
                }
            });
            
            if (reqVO.baseQty <= docItem.DocItemStos
                                        .Where(x => mapstoCanReturns.Any(y => y.ID == x.Sou_StorageObject_ID))
                                        .Sum(x => x.BaseQuantity))
            {
                var packInfo = baseTree.FirstOrDefault(x => x.type == StorageObjectType.PACK);
                
                if (packInfo == null)
                {
                    /*StorageObjectCriteria newSto = newSto = ADO.StorageObjectADO.GetInstant()
                        .Get(mapstoCanReturns.First().ID.Value, StorageObjectType.PACK, false, false, this.BuVO)
                        .Clone();*/
                    var skuMst = ADO.DataADO.GetInstant().SelectByCodeActive<ams_SKUMaster>(reqVO.packCode, this.BuVO);
                    var unitBaseMst = this.StaticValue.UnitTypes.First(x => x.ID == skuMst.UnitType_ID);
                    var packMst = ADO.MasterADO.GetInstant().GetPackMasterBySKU(skuMst.ID.Value, unitBaseMst.Code, this.BuVO);
                    var converUnit = StaticValue.ConvertToNewUnitBySKU(skuMst.ID.Value, reqVO.baseQty, skuMst.UnitType_ID.Value, docItem.UnitType_ID.Value);
                    StorageObjectCriteria newSto = new StorageObjectCriteria()
                    {
                        id = null,
                        code = reqVO.packCode,
                        baseQty = reqVO.baseQty,
                        baseUnitID = converUnit.baseUnitType_ID,
                        qty = converUnit.qty,
                        unitID = converUnit.unitType_ID,
                        areaID = baseInfo.areaID,
                        batch = reqVO.batch,
                        lot = reqVO.lot,
                        orderNo = reqVO.orderNo,
                        weiKG = converUnit.weiKg,
                        eventStatus = StorageObjectEventStatus.RECEIVED,
                        parentID = baseInfo.id,
                        parentType = baseInfo.type,
                        type = StorageObjectType.PACK,
                        mstID = packMst.ID.Value,
                        mapstos = new List<StorageObjectCriteria>(),
                        objectSizeID = packMst.ObjectSize_ID,
                        skuID = skuMst.ID,
                        warehouseID = baseInfo.warehouseID,
                        name = packMst.Name,
                        
                    };
                    if (baseInfo.eventStatus == StorageObjectEventStatus.NEW)
                    {
                        baseInfo.eventStatus = StorageObjectEventStatus.RECEIVED;
                        ADO.StorageObjectADO.GetInstant().PutV2(baseInfo, this.BuVO);
                    }
                    ADO.StorageObjectADO.GetInstant().PutV2(newSto, this.BuVO);
                    baseInfo.mapstos.Add(newSto);

                    ADO.DocumentADO.GetInstant().InsertMappingSTO(new amt_DocumentItemStorageObject()
                    {
                        DocumentItem_ID = docItem.ID.Value,
                        Sou_StorageObject_ID = newSto.id.Value,
                        Quantity = -newSto.qty,
                        UnitType_ID = newSto.unitID,
                        BaseQuantity = -newSto.baseQty,
                        BaseUnitType_ID = newSto.baseUnitID,
                        Status = EntityStatus.ACTIVE,
                    }, this.BuVO);
                }
                else
                {
                    var converUnit = StaticValue.ConvertToNewUnitBySKU(
                        packInfo.skuID.Value, reqVO.baseQty, packInfo.baseUnitID, packInfo.unitID);
                    packInfo.baseQty += reqVO.baseQty;
                    packInfo.qty += converUnit.qty;
                    packInfo.weiKG += (packInfo.weiKG / packInfo.baseQty) * reqVO.baseQty;
                    if (baseInfo.eventStatus == StorageObjectEventStatus.NEW)
                    {
                        baseInfo.eventStatus = StorageObjectEventStatus.RECEIVED;
                        ADO.StorageObjectADO.GetInstant().PutV2(baseInfo, this.BuVO);
                    }
                    ADO.StorageObjectADO.GetInstant().PutV2(packInfo, this.BuVO);
                    baseInfo.mapstos.Add(packInfo);

                    ADO.DocumentADO.GetInstant().InsertMappingSTO(new amt_DocumentItemStorageObject()
                    {
                        DocumentItem_ID = docItem.ID.Value,
                        Sou_StorageObject_ID = packInfo.id.Value,
                        Quantity = -converUnit.qty,
                        UnitType_ID = converUnit.unitType_ID,
                        BaseQuantity = -converUnit.baseQty,
                        BaseUnitType_ID = converUnit.baseUnitType_ID,
                        Status = EntityStatus.ACTIVE,
                    }, this.BuVO);
                }

            }else
            {
                throw new AMWException(this.Logger, AMWExceptionCode.V2002, "ไม่สามารถรับคืนสินค้าได้ เนื่องจาก จำนวนที่เหลือจากที่เบิกไม่สอดคล้องกัน");
            }
            return baseInfo;
            //ADO.DocumentADO.GetInstant().ListItemAndStoInDoc
        }


    }
}
