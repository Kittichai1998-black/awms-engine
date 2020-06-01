using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.ADO.StaticValue;
using AWMSEngine.Engine.V2.General;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business
{
    public class ScanMapSTOFromDoc : BaseEngine<ScanMapSTOFromDoc.TReq, StorageObjectCriteria>
    {
        public class TReq
        {
            public long? docID;
            public string baseCode;
            public long? warehouseID;
            public long? areaID;
            public long? locationID;
            public List<DocItems> docItems;
            public class DocItems
            {
                public long ID;
                public decimal Quantity;
            }
        }

        protected override StorageObjectCriteria ExecuteEngine(TReq reqVO)
        {


            var getDoc = ADO.DocumentADO.GetInstant().Get(reqVO.docID.Value, BuVO);

            if (getDoc == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบข้อมูล GR Document");

            if (reqVO.docItems == null || reqVO.docItems.Count() == 0)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบข้อมูล Document Items ที่เลือก");

            //add pallet

            //หน้าfont ช่อง pallet code เเสดงว่าของในพาเลทผูกกับ PD อะไรบ้าง
            StorageObjectCriteria newSto = new StorageObjectCriteria();
            long? idBaseSto = null;
            var getOldBase = ADO.StorageObjectADO.GetInstant().Get(reqVO.baseCode, reqVO.warehouseID, reqVO.areaID, false, true, BuVO);
            if (getOldBase != null)
            {
                var baseSto = getOldBase.ToTreeList().Find(x => x.type == StorageObjectType.BASE);
                idBaseSto = baseSto.id.Value;
            }
            else
            {
                var newBaseStoTReq = new MappingNewBaseAndSTO.TReq()
                {
                    baseCode = reqVO.baseCode,
                    warehouseID = reqVO.warehouseID,
                    areaID = reqVO.areaID,
                    locationID = reqVO.locationID
                };
                var newbase = new MappingNewBaseAndSTO().Execute(this.Logger, this.BuVO, newBaseStoTReq); ;
                idBaseSto = newbase.id;
            }

            reqVO.docItems.ForEach((x) => {
                var getDocItem = ADO.DocumentADO.GetInstant().GetItemAndStoInDocItem(x.ID, BuVO);
                if (getDocItem == null)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบข้อมูล Document Items");

                decimal sumQtyDisto = getDocItem.DocItemStos.Sum(z => z.Quantity ?? 0);
                decimal totalQty = getDocItem.Quantity ?? 0;
                if (x.Quantity > (totalQty - sumQtyDisto))
                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "จำนวนสินค้าของรายการ SKU: " + getDocItem.Code + " ที่ต้องการรับเข้าเกินจำนวนที่ระบุในเอกสาร");

                if (getDocItem.DocItemStos.Count() > 0)
                {
                    var getdistoMatch = new amt_DocumentItemStorageObject();
                    var getdisto = getDocItem.DocItemStos.FindAll(x =>
                    {
                        var getSou_STO_PACK = ADO.StorageObjectADO.GetInstant().Get(x.Sou_StorageObject_ID, StorageObjectType.PACK, true, true, BuVO);
                        var stolist = getSou_STO_PACK.ToTreeList();
                        var getBase = stolist.Find(y => y.type == StorageObjectType.BASE && y.code == reqVO.baseCode);

                        if (getBase != null)
                        {
                            if (getBase.areaID != reqVO.areaID)
                                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ระบุ Area ไม่ตรงกัน");

                            if (getBase.parentType == StorageObjectType.LOCATION && getBase.parentID != reqVO.locationID)
                                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ระบุ Location ไม่ตรงกัน");
                            var getPACK = stolist.Find(y =>
                                y.id == x.Sou_StorageObject_ID
                                && y.batch == getDocItem.Batch
                                && y.orderNo == getDocItem.OrderNo
                                && y.lot == getDocItem.Lot
                                && y.refID == getDoc.RefID
                                && y.ref1 == getDoc.Ref1
                                && y.ref2 == getDoc.Ref2);
                            if (getPACK != null)
                            {
                                return x.Sou_StorageObject_ID == getPACK.id;
                            }
                            else
                            {
                                return false;
                            }
                        }
                        else
                        {
                            return false;
                        }
                    });
                    if (getdisto.Count() > 0)
                    {
                        var getSTO_PACK = ADO.StorageObjectADO.GetInstant().Get(getdisto[0].Sou_StorageObject_ID, StorageObjectType.PACK, false, false, BuVO);

                        var baseUnitTypeConvt = StaticValue.ConvertToBaseUnitBySKU(getDocItem.SKUMaster_ID.Value, x.Quantity, getDocItem.UnitType_ID.Value);
                        decimal? baseQuantity = baseUnitTypeConvt.baseQty;

                        getSTO_PACK.qty += x.Quantity;
                        getSTO_PACK.baseQty += baseQuantity.Value;

                        var resStopack = AWMSEngine.ADO.StorageObjectADO.GetInstant().PutV2(getSTO_PACK, BuVO);
                        ADO.DocumentADO.GetInstant().UpdateMappingSTO(getdisto[0].ID.Value, null, getSTO_PACK.qty, getSTO_PACK.baseQty, EntityStatus.INACTIVE, BuVO);
                    }
                    else
                    {
                        gen_new_packSto();
                    }
                }
                else
                {
                    gen_new_packSto();
                }

                void gen_new_packSto()
                {
                    StaticValueManager.GetInstant().LoadUnitType(BuVO);
                    var sku = ADO.DataADO.GetInstant().SelectByID<ams_SKUMaster>(getDocItem.SKUMaster_ID, BuVO);
                    var pack = ADO.DataADO.GetInstant().SelectByID<ams_PackMaster>(getDocItem.PackMaster_ID, BuVO);
                    var unit = StaticValueManager.GetInstant().UnitTypes.Find(x => x.ID == getDocItem.UnitType_ID);
                    var objSizePack = StaticValueManager.GetInstant().ObjectSizes.Find(x => x.ID == pack.ObjectSize_ID);

                    var baseUnitTypeConvt = StaticValue.ConvertToBaseUnitBySKU(getDocItem.SKUMaster_ID.Value, x.Quantity, getDocItem.UnitType_ID.Value);
                    decimal? baseQuantity = baseUnitTypeConvt.baseQty;


                    StorageObjectCriteria packSto = new StorageObjectCriteria()
                    {
                        parentID = idBaseSto.Value,
                        parentType = StorageObjectType.BASE,
                        code = pack.Code,
                        eventStatus = StorageObjectEventStatus.NEW,
                        name = pack.Name,
                        qty = x.Quantity,
                        skuID = pack.SKUMaster_ID,
                        unitCode = unit.Code,
                        unitID = unit.ID.Value,
                        lot = getDocItem.Lot,
                        refID = getDoc.RefID,
                        ref1 = getDoc.Ref1,
                        ref2 = getDoc.Ref2,
                        baseUnitCode = StaticValueManager.GetInstant().UnitTypes.Find(x => x.ID == baseUnitTypeConvt.baseUnitType_ID).Code,
                        baseUnitID = baseUnitTypeConvt.baseUnitType_ID,
                        baseQty = baseUnitTypeConvt.baseQty,
                        type = StorageObjectType.PACK,
                        mstID = getDocItem.PackMaster_ID,
                        options = getDocItem.Options,
                        areaID = reqVO.areaID,

                    };
                    var resStopack = AWMSEngine.ADO.StorageObjectADO.GetInstant().PutV2(packSto, BuVO);

                    var new_disto = new amt_DocumentItemStorageObject()
                    {
                        ID = null,
                        DocumentItem_ID = x.ID,
                        Quantity = x.Quantity,
                        BaseQuantity = baseUnitTypeConvt.baseQty,
                        UnitType_ID = unit.ID.Value,
                        BaseUnitType_ID = baseUnitTypeConvt.baseUnitType_ID,
                        Sou_StorageObject_ID = resStopack,
                        Des_StorageObject_ID = resStopack,
                        Status = EntityStatus.ACTIVE
                    };
                    var disto = ADO.DocumentADO.GetInstant().InsertMappingSTO(new_disto, BuVO);
                }

            });


            newSto = ADO.StorageObjectADO.GetInstant().Get(idBaseSto.Value, StorageObjectType.BASE, false, true, BuVO);

            return newSto;
        }


    }
}