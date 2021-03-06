using AMWUtil.Exception;
using ADO.WMSStaticValue;
using AMSModel.Constant.EnumConst;
using AMSModel.Constant.StringConst;
using AMSModel.Criteria;
using AMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.General
{
    public class MappingNewBaseAndSTO : BaseEngine<MappingNewBaseAndSTO.TReq, MappingNewBaseAndSTO.TRes>
    {
        public class TReq
        {
            public string baseCode;
            public string unitCode;
            public bool isEmptyPallet = false;
            public long? warehouseID;
            public long? areaID;
            public long? locationID;
            public decimal? weight;//น้ำหนัก Kg.
            public decimal? width;//กว้าง M.
            public decimal? length;//ยาว M.
            public decimal? height;//สูง M.
            public bool autoDoc;
        }
        public class TRes
        {
            public long? id;
        }
        protected override TRes ExecuteEngine(TReq reqVO)
        {

            var _base = ADO.WMSDB.DataADO.GetInstant().SelectByCodeActive<ams_BaseMaster>(reqVO.baseCode, BuVO);

            if (_base == null)
            {
                var unitType = new ams_UnitType();
                if(reqVO.unitCode != null)
                {
                    unitType = StaticValueManager.GetInstant().UnitTypes.Find(x => x.Code == reqVO.unitCode);
                }
                else
                {
                    unitType = StaticValueManager.GetInstant().UnitTypes.Find(x => x.Code == "PL");
                }
                var ObjectSizes_Default = StaticValueManager.GetInstant().ObjectSizes.Find(x=> x.IsDefault == true && x.ObjectType == StorageObjectType.BASE);

                ams_BaseMaster newBase = new ams_BaseMaster()
                {
                    Code = reqVO.baseCode,
                    ObjectSize_ID = ObjectSizes_Default.ID.Value,
                    UnitType_ID = unitType.ID.Value,
                    Name = reqVO.isEmptyPallet ? "Empty Pallet" : "Pallet",
                    //WeightKG = BaseMasterType.Weight,
                    //BaseMasterType_ID = BaseMasterType.ID.Value,
                    Status = EntityStatus.ACTIVE
                };

                var idbase = ADO.WMSDB.DataADO.GetInstant().Insert<ams_BaseMaster>( newBase, BuVO);
                _base = ADO.WMSDB.DataADO.GetInstant().SelectByID<ams_BaseMaster>(idbase, BuVO);
                if (_base == null)
                {
                    throw new AMWException(Logger, AMWExceptionCode.V1001, "Pallet : " + reqVO.baseCode + " Not Found.");
                }
            }
            var sto = ADO.WMSDB.StorageObjectADO.GetInstant().Get(reqVO.baseCode, null, reqVO.areaID, false, true, this.BuVO);
            if (sto == null)
            {

                //สร้าง sto base 
                var _unitType = StaticValueManager.GetInstant().UnitTypes.FirstOrDefault(x => x.ID == _base.UnitType_ID);
                var _objSize = StaticValueManager.GetInstant().ObjectSizes.FirstOrDefault(x => x.ObjectType == StorageObjectType.BASE);

                //ทำengine map new sku ใหม่ packใหม่

                StorageObjectCriteria baseSto = new StorageObjectCriteria()
                {
                    code = reqVO.baseCode,
                    eventStatus = reqVO.isEmptyPallet ? StorageObjectEventStatus.PACK_RECEIVED : StorageObjectEventStatus.PACK_NEW,
                    name = reqVO.isEmptyPallet ? "Empty Pallet" : "Pallet",
                    qty = 1,
                    unitCode = _unitType.Code,
                    unitID = _unitType.ID.Value,
                    baseUnitCode = _unitType.Code,
                    baseUnitID = _unitType.ID.Value,
                    baseQty = 1,
                    type = StorageObjectType.BASE,
                    mstID = _base.ID.Value,
                    areaID = reqVO.areaID.Value,
                    warehouseID = reqVO.warehouseID.Value,
                    weiKG = reqVO.weight,
                    lengthM = reqVO.length,
                    heightM = reqVO.height,
                    widthM = reqVO.width,
                    AuditStatus = AuditStatus.PASSED,
                    IsHold = false
                };

                if (reqVO.locationID != null)
                {
                    baseSto.parentID = reqVO.locationID;
                    baseSto.parentType = StorageObjectType.LOCATION;
                }
                var optionsSto = "";
                if (reqVO.autoDoc)
                    optionsSto = AMWUtil.Common.ObjectUtil.QryStrSetValue(baseSto.options, OptionVOConst.OPT_AUTO_DOC, "true");

                baseSto.options = optionsSto;

                var baseStoID = ADO.WMSDB.StorageObjectADO.GetInstant().PutV2(baseSto, BuVO);
                return new TRes()
                {
                    id = baseStoID
                };
            }
            else
            {
                if (sto.areaID != reqVO.areaID || sto.parentID != reqVO.locationID)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Base Code : " + reqVO.baseCode + "ไม่ตรงกับตำแหน่งที่อยู่ปัจจุบัน");
                return new TRes()
                {
                    id = sto.id.Value
                };
            }
        }

    }
}
