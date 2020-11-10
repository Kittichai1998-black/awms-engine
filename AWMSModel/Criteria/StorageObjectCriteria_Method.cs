using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria.SP.Response;
using System;
using System.Collections.Generic;
using System.Text;
using System.Linq;
using AMWUtil.Common;
using AWMSModel.Entity;
using AMWUtil.Logger;
using AMWUtil.Exception;

namespace AWMSModel.Criteria
{
    public partial class StorageObjectCriteria : ITreeObject
    {

        public static StorageObjectCriteria GetMapStoLastFocus(StorageObjectCriteria mapsto)
        {
            var res = mapsto.mapstos.FirstOrDefault(x => x.isFocus);
            if (res != null)
                return GetMapStoLastFocus(res);
            return mapsto;
        }

        public static StorageObjectCriteria NewPack(
            StorageObjectCriteria parentSto,
            ams_PackMaster stoMst,
            decimal qty,
            string unitCode,
            string batch, string lot, string orderNo, string options,
            DateTime? stoProductDate,
            IStaticValueManager staticValue)
        {
            if (parentSto == null)
                throw new Exception("Can't Create STO. parentSto is null.");
            return NewSTO(parentSto, stoMst, qty, unitCode, null, batch, lot, orderNo, options, stoProductDate, staticValue);
        }
        public static StorageObjectCriteria NewPack(
            ams_PackMaster stoMst,
            decimal qty,
            string unitCode,
            long? areaID,
            string batch, string lot, string orderNo, string options,
            DateTime? stoProductDate,
            IStaticValueManager staticValue)
        {
            return NewSTO(null, stoMst, qty, unitCode, areaID, batch, lot, orderNo, options, stoProductDate, staticValue);
        }
        public static StorageObjectCriteria NewBase(
            StorageObjectCriteria parentSto,
            ams_BaseMaster stoMst, string options,
            IStaticValueManager staticValue)
        {
            if (parentSto == null)
                throw new Exception("Can't Create STO. parentSto is null.");
            return NewSTO(parentSto, stoMst, 1, null, null, null, null, null, options, null, staticValue);
        }
        public static StorageObjectCriteria NewBase(
            ams_BaseMaster stoMst, long areaID, string options,
            IStaticValueManager staticValue)
        {
            return NewSTO(null, stoMst, 1, null, areaID, null, null, null, options, null, staticValue);
        }
        public static StorageObjectCriteria NewLocation(
            ams_AreaLocationMaster stoMst,
            IStaticValueManager staticValue)
        {
            return NewSTO(null, stoMst, 1, null, null, null, null, null, null, null, staticValue);
        }
        private static StorageObjectCriteria NewSTO(
            StorageObjectCriteria parentSto,
            BaseEntitySTD stoMst,
            decimal qty,
            string unitCode,
            long? areaID,
            string batch, string lot, string orderNo, string options, DateTime? stoProductDate, 
            IStaticValueManager staticValue)
        {

            //var objSize = staticValue.ObjectSizes.Find(x => x.ID == objSizeID);
            StorageObjectType stoType = stoMst is ams_BaseMaster ? StorageObjectType.BASE : stoMst is ams_AreaLocationMaster ? StorageObjectType.LOCATION : StorageObjectType.PACK;
            ams_AreaMaster stoArea = null; 
            ams_UnitType stoUnitType = null;
            //ams_SKUMasterType stoSKUType = null;
            ams_ObjectSize stoObjectSize = null;
            long? stoSkuID = null;

            if (stoType == StorageObjectType.PACK)
            {
                var stoMst2 = ((ams_PackMaster)stoMst);
                stoObjectSize = staticValue.ObjectSizes.FirstOrDefault(x => x.ID == stoMst2.ObjectSize_ID);
                stoUnitType = staticValue.UnitTypes.FirstOrDefault(x => x.Code == unitCode && x.ObjectType == StorageObjectType.PACK);
                stoArea = parentSto != null ?
                    staticValue.AreaMasters.FirstOrDefault(x => x.ID == parentSto.areaID) :
                    staticValue.AreaMasters.FirstOrDefault(x => x.ID == areaID);
                stoSkuID = stoMst2.SKUMaster_ID;
            }
            else if (stoType == StorageObjectType.BASE)
            {
                var stoMst2 = ((ams_BaseMaster)stoMst);
                stoObjectSize = staticValue.ObjectSizes.FirstOrDefault(x => x.ID == stoMst2.ObjectSize_ID);
                stoUnitType = staticValue.UnitTypes.FirstOrDefault(x => x.ID == stoMst2.UnitType_ID);
                stoArea = parentSto != null ?
                    staticValue.AreaMasters.FirstOrDefault(x => x.ID == parentSto.areaID) :
                    staticValue.AreaMasters.FirstOrDefault(x => x.ID == areaID);
            }
            else if (stoType == StorageObjectType.LOCATION)
            {
                var stoMst2 = ((ams_AreaLocationMaster)stoMst);
                stoObjectSize = staticValue.ObjectSizes.FirstOrDefault(x => x.ID == stoMst2.ObjectSize_ID);
                stoUnitType = staticValue.UnitTypes.FirstOrDefault(x => x.ID == stoMst2.UnitType_ID);
                stoArea = staticValue.AreaMasters.FirstOrDefault(x => x.ID == stoMst2.AreaMaster_ID);
            }

            if (stoUnitType == null)
                throw new Exception("Can't Create STO. UnitType not found.");
            if (stoObjectSize == null)
                throw new Exception("Can't Create STO. ObjectSize not found.");

            var stoBaseUnitTypeConvert = stoType == StorageObjectType.PACK ?
                staticValue.ConvertToBaseUnitByPack(stoMst.ID.Value, qty, stoUnitType.ID.Value) : null;
            
            var res = new StorageObjectCriteria()
            {
                id = stoType == StorageObjectType.LOCATION ? stoMst.ID : null,
                mstID = stoMst.ID,
                code = stoMst.Code,
                name = stoMst.Name,
                type = stoType,
                skuID = stoSkuID,
                productDate = stoProductDate,

                parentID = parentSto != null ? parentSto.id : null,
                parentType = parentSto != null ? (StorageObjectType?)parentSto.type : null,

                areaID = stoArea.ID,
                warehouseID = stoArea.Warehouse_ID.Value,

                orderNo = orderNo,
                lot = lot,
                batch = batch,

                qty = qty,
                unitID = stoUnitType.ID.Value,
                unitCode = stoUnitType.Code,

                baseQty = stoBaseUnitTypeConvert != null ? stoBaseUnitTypeConvert.newQty : 1,
                baseUnitID = stoBaseUnitTypeConvert != null ? stoBaseUnitTypeConvert.newUnitType_ID : stoUnitType.ID.Value,
                baseUnitCode = stoBaseUnitTypeConvert != null ?
                                    staticValue.UnitTypes.First(x => x.ID == stoBaseUnitTypeConvert.newUnitType_ID).Code : stoUnitType.Code,

                widthM = null,
                heightM = null,
                lengthM = null,
                volume = 0,
                innerVolume = 0,
                weiKG = null,
                innerWeiKG = null,

                options = options,

                objectSize = new ObjectSize()
                {
                    id = stoObjectSize.ID.Value,
                    name = stoObjectSize.Name,
                    volume = stoObjectSize.Volume,
                    weiAccept = stoObjectSize.PercentWeightAccept,
                    minInnerVolume = stoObjectSize.MinInnerVolume,
                    maxInnerVolume = stoObjectSize.MaxInnerVolume,
                    maxInnerWeiKG = stoObjectSize.MaxInnerWeightKG,
                    minInnerWeiKG = stoObjectSize.MinInnerWeightKG,
                    inners = stoObjectSize.ObjectSizeInners.Select(x => new StorageObjectCriteria.ObjectSize.ObjectSizeInner()
                    {
                        innerObjectSizeID = x.InnerObjectSize_ID,
                        innerObjectSizeName = staticValue.ObjectSizes.Find(y => y.ID == x.InnerObjectSize_ID).Name,
                        //innerSumVolume = 0
                    }).ToList(),

                },
                
                mapstos = new List<StorageObjectCriteria>(),
                eventStatus = StorageObjectEventStatus.NEW,
                isFocus = stoType == StorageObjectType.PACK ? true : false,

            };
            return res;
        }


        public static StorageObjectCriteria GenerateBySP(List<SPOutSTOMiniCriteria> stos, 
            List<ams_ObjectSize> staticObjectSizes,
            List<ams_UnitType> staticUnitTypes,
            List<ams_SKUMasterType> staticSKUMasterType,
            string codeFocus)
        {
            return GenerateBySP(stos, staticObjectSizes, staticUnitTypes, staticSKUMasterType, null, codeFocus);
        }
        public static StorageObjectCriteria GenerateBySP(List<SPOutSTOMiniCriteria> stos, 
            List<ams_ObjectSize> staticObjectSizes,
            List<ams_UnitType> staticUnitTypes,
            List<ams_SKUMasterType> staticSKUMasterType,
            long idFocus)
        {
            return GenerateBySP(stos, staticObjectSizes, staticUnitTypes, staticSKUMasterType, idFocus, null);
        }
        private static StorageObjectCriteria GenerateBySP(List<SPOutSTOMiniCriteria> stos,
            List<ams_ObjectSize> staticObjectSizes, List<ams_UnitType> staticUnitTypes, List<ams_SKUMasterType> staticSKUMasterType,
            long? idFocus, string codeFocus)
        {
            if (stos.Count() == 0) return null;
            bool isFucus = false;

            List<dynamic> findStoRoots = stos.GroupBy(x => new { id = x.id, parentID = x.parentID, objectSizeID = x.objectSizeID, parentType = x.parentType, type = x.type }).Select(x => x.Key).ToList<dynamic>();
            dynamic stoRoot = findStoRoots.FirstOrDefault(x => !findStoRoots.Any(y => y.id == x.parentID && y.id != null && y.type == x.parentType));
            //var sos = staticObjectSizes.FirstOrDefault(x => x.ID == stoRoot.objectSizeID);
            var res = generateMapstos(stoRoot.parentID, stoRoot.parentType, out isFucus).FirstOrDefault();

            List<StorageObjectCriteria> generateMapstos(long? parentID, StorageObjectType? parentType, out bool outParentIsFocus)
            {
                List<StorageObjectCriteria> r =
                    stos.Where(x => x.parentID == parentID && x.parentType == parentType)
                    .Select(x => {
                        var sos2 = staticObjectSizes.FirstOrDefault(y => y.ID == x.objectSizeID);
                        if (sos2 == null)
                            throw new Exception("ไม่พบ ObjectSize");

                        bool isFocus = false;
                        var s = new StorageObjectCriteria()
                        {
                            id = x.id,
                            type = x.type,
                            qty = x.qty,
                            unitID = x.unitID,
                            unitCode = staticUnitTypes.First(y => y.ID == x.unitID).Code,
                            baseQty = x.baseQty,
                            baseUnitID = x.baseUnitID,
                            baseUnitCode = staticUnitTypes.First(y => y.ID == x.baseUnitID).Code,
                            parentID = x.parentID,
                            parentType = x.parentType,
                            warehouseID = x.warehouseID,
                            areaID = x.areaID,
                            code = x.code,
                            name = x.name,
                            mstID = x.mstID,
                            mstWeiKG = x.mstWeiKG,
                            skuID = x.skuID,

                            weiKG = x.weiKG,
                            volume = 0,
                            innerVolume = 0,
                            innerWeiKG = 0,

                            lengthM = x.lengthM,
                            widthM = x.widthM,
                            heightM = x.heightM,
                            productDate = x.productDate,
                            expiryDate = x.expiryDate,
                            options = x.options ?? string.Empty,
                            mapstos = generateMapstos(x.id, x.type, out isFocus),
                            isFocus = isFocus,
                            eventStatus = x.eventStatus,
                            orderNo = x.orderNo,
                            lot = x.lot,
                            batch = x.batch,
                            refID = x.refID,
                            ref1 = x.ref1,
                            ref2 = x.ref2,
                            ref3 = x.ref3,
                            ref4 = x.ref4,
                            IsHold = x.IsHold,
                            AuditStatus = x.AuditStatus,
                            IsStock = x.IsStock,

                            objectSize = new ObjectSize()
                            {
                                id = x.objectSizeID.Value,
                                name = sos2.Name,
                                volume = sos2.Volume,
                                weiAccept = sos2.PercentWeightAccept,
                                minInnerWeiKG = sos2.MinInnerWeightKG,
                                maxInnerWeiKG = sos2.MaxInnerWeightKG,
                                minInnerVolume = sos2.MinInnerVolume,
                                maxInnerVolume = sos2.MaxInnerVolume,
                            },
                            skuTypeID = x.skuTypeID,
                            skuTypeName = x.skuTypeID != null ? staticSKUMasterType.First(y => y.ID == x.skuTypeID).Name : null, 
                        };
                        s.objectSize.inners = sos2.ObjectSizeInners
                                    .Select(y => new ObjectSize.ObjectSizeInner()
                                    {
                                        innerObjectSizeID = y.InnerObjectSize_ID,
                                        innerObjectSizeName = staticObjectSizes.First(z => z.ID == y.InnerObjectSize_ID).Name,
                                        //innerSumVolume = s.mapstos.Sum(z => z.objectSize.inners.Sum(y => y.innerSumVolume))
                                    }).ToList();

                        s.innerVolume = s.mapstos.Sum(y => y.volume);
                        s.volume = (s.qty * s.objectSize.volume) + s.innerVolume;
                        if (!s.weiKG.HasValue && s.mapstos.TrueForAll(y => y.weiKG.HasValue))
                            s.weiKG = s.mapstos.Sum(y => y.weiKG.Value);
                        s.innerWeiKG = x.weiKG - x.mstWeiKG;


                        if (!s.isFocus && (s.id == idFocus || s.code.ToUpper() == (codeFocus != null ? codeFocus.ToUpper() : null)) && s.type != StorageObjectType.PACK)
                            s.isFocus = true;
                        return s;
                    }).ToList();
                outParentIsFocus = r.Any(x => x.isFocus);
                return r;
            }

            return res;
        }

        public string GetCheckSum()
        {
            var s = this;
            return EncryptUtil.GenerateMD5(
                        string.Format("{0}|{1}|{2}|{3}|{4}|{5}|{6}|{7}|{8}|{9}|{10:dd-MM-yy}|{11:dd-MM-yy}",
                            s.mstID, s.type.GetValueInt(), s.forCustomerID, s.orderNo, s.batch,
                            s.lot, s.ref1, s.ref2, s.ref3, s.ref4, 
                            s.productDate, s.expiryDate));
        }

    }
}
