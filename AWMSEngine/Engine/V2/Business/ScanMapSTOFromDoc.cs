using AMWUtil.Common;
using AMWUtil.Exception;
using ADO.WMSStaticValue;
using AWMSEngine.Engine.V2.General;
using AMSModel.Constant.EnumConst;
using AMSModel.Constant.StringConst;
using AMSModel.Criteria;
using AMSModel.Entity;
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


            var getDoc = ADO.WMSDB.DocumentADO.GetInstant().Get(reqVO.docID.Value, BuVO);

            if (getDoc == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบข้อมูล GR Document");

            if (reqVO.docItems == null || reqVO.docItems.Count() == 0)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบข้อมูล Document Items ที่เลือก");

            //add pallet

            //หน้าfont ช่อง pallet code เเสดงว่าของในพาเลทผูกกับ PD อะไรบ้าง
            StorageObjectCriteria newSto = new StorageObjectCriteria();
            long? idBaseSto = null;
            var getOldBase = ADO.WMSDB.StorageObjectADO.GetInstant().Get(reqVO.baseCode, reqVO.warehouseID, reqVO.areaID, false, true, BuVO);
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
                var getDocItem = ADO.WMSDB.DocumentADO.GetInstant().GetItemAndStoInDocItem(x.ID, BuVO);
                if (getDocItem == null)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบข้อมูล Document Items");

                decimal sumQtyDisto = getDocItem.DocItemStos.Sum(z => z.Quantity ?? 0);
                decimal totalQty = getDocItem.Quantity ?? 0;
                if (x.Quantity > (totalQty - sumQtyDisto))
                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "จำนวนสินค้าของรายการ SKU: " + getDocItem.Code + " ที่ต้องการรับเข้าเกินจำนวนที่ระบุในเอกสาร");

                if (getDocItem.DocItemStos.Count() > 0)
                {
                    var getdistoMatch = new amt_DocumentItemStorageObject();
                    var getdisto = getDocItem.DocItemStos.FindAll(disto =>
                    {

                        //var getSou_STO_PACK = ADO.WMSDB.StorageObjectADO.GetInstant().Get(disto.Sou_StorageObject_ID, StorageObjectType.PACK, false, true, BuVO);
                        var getBase = ADO.WMSDB.StorageObjectADO.GetInstant().Get(idBaseSto.Value, StorageObjectType.BASE, false, true, BuVO);

                        if (getBase != null)
                        {
                            var stolist = getBase.ToTreeList();

                            if (getBase.areaID != reqVO.areaID)
                                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ระบุ Area ไม่ตรงกัน");
                            
                            if(reqVO.locationID != null)
                            {
                                if (getBase.parentType == StorageObjectType.LOCATION && getBase.parentID != reqVO.locationID)
                                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ระบุ Location ไม่ตรงกัน");
                            }
                           
                            return stolist.Any(y => y.id == disto.Sou_StorageObject_ID && y.refID == getDocItem.RefID);
                            //var getPACK = stolist.Find(y =>
                            //    y.id == x.Sou_StorageObject_ID
                            //    && y.lot == getDocItem.Lot
                            //    && y.refID == getDoc.RefID
                            //    && y.ref1 == getDoc.Ref1
                            //    && y.ref2 == getDoc.Ref2);
                            //if (getPACK != null)
                            //{
                            //    return true;
                            //    //return x.Sou_StorageObject_ID == getPACK.id;
                            //}
                            //else
                            //{
                            //    return false;
                            //}
                        }
                        else
                        {
                            return false;
                        }
                    });
                    if (getdisto.Count() > 0)
                    {
                        var getSTO_PACK = ADO.WMSDB.StorageObjectADO.GetInstant().Get(getdisto[0].Sou_StorageObject_ID, StorageObjectType.PACK, false, false, BuVO);

                        var baseUnitTypeConvt = StaticValue.ConvertToBaseUnitBySKU(getDocItem.SKUMaster_ID.Value, x.Quantity, getDocItem.UnitType_ID.Value);
                        decimal? baseQuantity = baseUnitTypeConvt.newQty;

                        getSTO_PACK.qty += x.Quantity;
                        getSTO_PACK.baseQty += baseQuantity.Value;

                        var resStopack = ADO.WMSDB.StorageObjectADO.GetInstant().PutV2(getSTO_PACK, BuVO);
                        ADO.WMSDB.DistoADO.GetInstant().Update(getdisto[0].ID.Value, null, getSTO_PACK.qty, getSTO_PACK.baseQty, EntityStatus.INACTIVE, BuVO);
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
                    var sku = ADO.WMSDB.DataADO.GetInstant().SelectByID<ams_SKUMaster>(getDocItem.SKUMaster_ID, BuVO);
                    var pack = ADO.WMSDB.DataADO.GetInstant().SelectByID<ams_PackMaster>(getDocItem.PackMaster_ID, BuVO);
                    var unit = StaticValueManager.GetInstant().UnitTypes.Find(x => x.ID == getDocItem.UnitType_ID);
                    var objSizePack = StaticValueManager.GetInstant().ObjectSizes.Find(x => x.ID == pack.ObjectSize_ID);

                    var baseUnitTypeConvt = StaticValue.ConvertToBaseUnitBySKU(getDocItem.SKUMaster_ID.Value, x.Quantity, getDocItem.UnitType_ID.Value);
                    decimal? baseQuantity = baseUnitTypeConvt.newQty;
                    //var option = "";
                    //option = ObjectUtil.QryStrSetValue(getDocItem.Options, OptionVOConst.OPT_DOCITEM_ID, x.ID.ToString());
                    DateTime? incubatedate = getDocItem.ProductionDate == null ? (DateTime?)null : getDocItem.IncubationDay != null ? 
                        getDocItem.ProductionDate.Value.AddDays(Convert.ToDouble(getDocItem.IncubationDay) - 1) : (DateTime?)null;
                    DateTime? shelflifedate = getDocItem.ExpireDate == null ? (DateTime?)null : getDocItem.ShelfLifeDay != null ?
                        getDocItem.ExpireDate.Value.AddDays(Convert.ToDouble(-getDocItem.ShelfLifeDay) + 1) : (DateTime?)null;
                    var auditstatus = StaticValueManager.GetInstant().GetConfigValue(ConfigFlow.AUDIT_STATUS_DEFAULT, getDoc.DocumentProcessType_ID);

                    var holdstatus = StaticValueManager.GetInstant().GetConfigValue(ConfigFlow.HOLD_STATUS_DEFAULT, getDoc.DocumentProcessType_ID);

                    StorageObjectCriteria packSto = new StorageObjectCriteria()
                    {
                        parentID = idBaseSto,
                        parentType = StorageObjectType.BASE,
                        code = pack.Code,
                        eventStatus = StorageObjectEventStatus.NEW,
                        forCustomerID = getDoc.For_Customer_ID,
                        name = pack.Name,
                        qty = x.Quantity,
                        skuID = pack.SKUMaster_ID,
                        unitCode = unit.Code,
                        unitID = unit.ID.Value,
                        lot = getDocItem.Lot,
                        itemNo = getDocItem.ItemNo,
                        //refID = getDocItem.RefID,
                        ref1 = getDocItem.Ref1,
                        ref2 = getDocItem.Ref2,
                        ref3 = getDocItem.Ref3,
                        ref4 = getDocItem.Ref4,
                        baseUnitCode = StaticValueManager.GetInstant().UnitTypes.Find(x => x.ID == baseUnitTypeConvt.newUnitType_ID).Code,
                        baseUnitID = baseUnitTypeConvt.newUnitType_ID,
                        baseQty = baseUnitTypeConvt.newQty,
                        type = StorageObjectType.PACK,
                        mstID = getDocItem.PackMaster_ID,
                        //options = option,
                        areaID = reqVO.areaID,
                        productDate = getDocItem.ProductionDate,
                        expiryDate = getDocItem.ExpireDate,
                        incubationDate = incubatedate,
                        shelfLifeDate = shelflifedate,
                        AuditStatus = EnumUtil.GetValueEnum<AuditStatus>(auditstatus),
                        IsHold = Convert.ToBoolean(Convert.ToInt16(holdstatus))
                    };
                    var newPackCheckSum = packSto.GetCheckSum();
                    packSto.refID = newPackCheckSum;

                    var resStopack = ADO.WMSDB.StorageObjectADO.GetInstant().PutV2(packSto, BuVO);

                    var new_disto = new amt_DocumentItemStorageObject()
                    {
                        ID = null,
                        DocumentItem_ID = x.ID,
                        Quantity = x.Quantity,
                        BaseQuantity = baseUnitTypeConvt.newQty,
                        UnitType_ID = unit.ID.Value,
                        BaseUnitType_ID = baseUnitTypeConvt.newUnitType_ID,
                        Sou_StorageObject_ID = resStopack,
                        Des_StorageObject_ID = resStopack,
                        Status = EntityStatus.INACTIVE
                    };
                    var disto = ADO.WMSDB.DistoADO.GetInstant().Insert(new_disto, BuVO);
                }

            });


            newSto = ADO.WMSDB.StorageObjectADO.GetInstant().Get(idBaseSto.Value, StorageObjectType.BASE, false, true, BuVO);

            return newSto;
        }


    }
}