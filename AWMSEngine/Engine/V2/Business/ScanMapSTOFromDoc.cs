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
                };
                var newbase = new MappingNewBaseAndSTO().Execute(this.Logger, this.BuVO, newBaseStoTReq); ;
                idBaseSto = newbase.id;
            }

            reqVO.docItems.ForEach((x) => {
                var getDocItem = ADO.DocumentADO.GetInstant().GetItemAndStoInDocItem(x.ID, BuVO);
                if (getDocItem == null)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบข้อมูล Document Items");

                //lot, ref1
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
                    baseUnitCode = StaticValueManager.GetInstant().UnitTypes.Find(x => x.ID == baseUnitTypeConvt.baseUnitType_ID).Code,
                    baseUnitID = baseUnitTypeConvt.baseUnitType_ID,
                    baseQty = baseUnitTypeConvt.baseQty,
                    objectSizeID = objSizePack.ID,
                    type = StorageObjectType.PACK,
                    objectSizeName = objSizePack.Name,
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
            });


            newSto = ADO.StorageObjectADO.GetInstant().Get(idBaseSto.Value, StorageObjectType.BASE, false, true, BuVO);

            return newSto;
        }
 
         
    }
}
