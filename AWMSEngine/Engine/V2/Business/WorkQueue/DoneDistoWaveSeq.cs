using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.ADO.StaticValue;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.WorkQueue
{
    public class DoneDistoWaveSeq : BaseEngine<DoneDistoWaveSeq.TReq, DoneDistoWaveSeq.TRes>
    {
        public class TReq
        {
            public List<DistoList> distos;
            public class DistoList
            {
                public long distoID;
                public string baseCode;
                public string locationCode;
                public decimal? baseQty;
            }
        }
        public class TRes
        {
            public List<amt_DocumentItemStorageObject> distos;
            public List<amt_WaveSeq> waveSeqs;
        }
        protected override TRes ExecuteEngine(TReq reqVO)
        {
            var distoList = new List<amt_DocumentItemStorageObject>();
            var wavList = new List<amt_Wave>();
            var distos = ADO.DistoADO.GetInstant().GetListDisto(reqVO.distos.Select(x => x.distoID).ToList(), this.BuVO);
            if(distos.Any(x=> x.Status == EntityStatus.ACTIVE))
            {
                var findActive = distos.Find(x => x.Status == EntityStatus.ACTIVE);
                throw new AMWException(this.Logger, AMWExceptionCode.V1002, $"งานนี้ถูกทำงานแล้ว ไม่สามารถทำงานซ้ำได้ ID : {findActive.ID}");
            }

            var docItemIDs = distos.Select(x => x.DocumentItem_ID).Distinct().ToList();
            var documentItems = ADO.DataADO.GetInstant().SelectBy<amt_DocumentItem>(
                new SQLConditionCriteria[] { new SQLConditionCriteria("ID", string.Join(',', docItemIDs), SQLOperatorType.IN) },
                this.BuVO);

            var pstoIDs = distos.Select(x => x.Sou_StorageObject_ID).Distinct().ToList();
            var pstos = ADO.DataADO.GetInstant().SelectBy<amt_StorageObject>(
                new SQLConditionCriteria[] { new SQLConditionCriteria("ID", string.Join(',', pstoIDs), SQLOperatorType.IN) },
                this.BuVO);

            var waveSeqIDs = distos.Select(x => x.Sou_WaveSeq_ID).Distinct().ToList();
            var waveSeqs = ADO.DataADO.GetInstant().SelectBy<amt_WaveSeq>(
                new SQLConditionCriteria[] { new SQLConditionCriteria("ID", string.Join(',', waveSeqIDs), SQLOperatorType.IN) },
                this.BuVO);

            distos.ForEach(disto =>
            {
                var waveSeq = waveSeqs.Find(x => x.ID == disto.Sou_WaveSeq_ID);
                if (waveSeq == null)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบ Wave Sequence");

                if (waveSeq.End_StorageObject_EventStatus == StorageObjectEventStatus.ALLOCATED)
                {
                    var currentSto = pstos.Find(x => x.ID == disto.Sou_StorageObject_ID);
                    disto.BaseQuantity = currentSto.BaseQuantity;
                    disto.Quantity = currentSto.Quantity;
                    disto.Des_StorageObject_ID = currentSto.ID;
                    disto.Status = EntityStatus.ACTIVE;
                    ADO.DistoADO.GetInstant().Update(disto, this.BuVO);
                }
                else
                {
                    var reqData = reqVO.distos.Find(x => x.distoID == disto.ID);

                    var docItemQty = documentItems.Find(x => x.ID == disto.DocumentItem_ID).BaseQuantity;
                    var sumQtyByDocItem = ADO.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(
                        new SQLConditionCriteria[] { new SQLConditionCriteria("DocumentItem_ID", disto.DocumentItem_ID, SQLOperatorType.EQUALS) },
                        this.BuVO).Sum(x=> x.Quantity.HasValue ? x.Quantity : 0);

                    var souPsto = pstos.Find(x => x.ID == disto.Sou_StorageObject_ID);

                    decimal pickQty = 0;
                    if (!disto.Quantity.HasValue)
                    {
                        pickQty = souPsto.Quantity;
                    }
                    else
                    {
                        pickQty = disto.Quantity.Value;
                    }

                    var souBsto = ADO.StorageObjectADO.GetInstant().Get(souPsto.ParentStorageObject_ID == null ? souPsto.ID.Value : souPsto.ParentStorageObject_ID.Value, StorageObjectType.BASE, false, true, this.BuVO);

                    ams_AreaLocationMaster location = ADO.DataADO.GetInstant().SelectByCodeActive<ams_AreaLocationMaster>(reqData.locationCode, this.BuVO);
                    if (location == null)
                        location = ADO.DataADO.GetInstant().SelectByID<ams_AreaLocationMaster>(souBsto.mstID, this.BuVO);

                    if (location == null)
                        throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบตำแหน่งของ Pack");

                    var desBsto = MapBase(reqData.baseCode, location.AreaMaster_ID, location.ID);
                    //sumQtyByDocItem + pickQty > docItemQty
                    if (pickQty > souPsto.BaseQuantity)
                    {
                        throw new AMWException(this.Logger, AMWExceptionCode.V1001, $"หยิบสินค้าเกินจำนวนที่กำหนด");
                    }
                    else if (sumQtyByDocItem == docItemQty && pickQty == 0)
                    {
                        disto.Quantity = 0;
                        disto.BaseQuantity = 0;
                        disto.Status = EntityStatus.ACTIVE;
                        disto.Des_StorageObject_ID = souPsto.ID;
                        ADO.DistoADO.GetInstant().Update(disto, this.BuVO);
                    }
                    else if (sumQtyByDocItem + pickQty == docItemQty)
                    {
                        var desSto = this.MapPackToBase(souPsto, pickQty, disto, souBsto, desBsto, location, reqData, waveSeq);

                        disto.Quantity = pickQty;
                        disto.BaseQuantity = StaticValue.ConvertToNewUnitByPack(souPsto.PackMaster_ID, pickQty, disto.UnitType_ID, disto.BaseUnitType_ID).baseQty;
                        disto.Status = EntityStatus.ACTIVE;
                        disto.Des_StorageObject_ID = desSto.id;
                        ADO.DistoADO.GetInstant().Update(disto, this.BuVO);
                    }
                    else if (sumQtyByDocItem + pickQty < docItemQty)
                    {
                        var desSto = this.MapPackToBase(souPsto, pickQty, disto, souBsto, desBsto, location, reqData, waveSeq);
                        disto.Quantity = pickQty;
                        disto.BaseQuantity = StaticValue.ConvertToNewUnitByPack(souPsto.PackMaster_ID, pickQty, disto.UnitType_ID, disto.BaseUnitType_ID).baseQty;
                        disto.Status = EntityStatus.ACTIVE;
                        disto.Des_StorageObject_ID = desSto.id;
                        ADO.DistoADO.GetInstant().Update(disto, this.BuVO);

                        if(desSto.id != souPsto.ID)
                        {
                            var newDisto = disto.Clone();
                            newDisto.ID = null;
                            newDisto.Des_StorageObject_ID = null;
                            newDisto.Quantity = null;
                            newDisto.BaseQuantity = null;
                            newDisto.Status = EntityStatus.INACTIVE;
                            ADO.DistoADO.GetInstant().Create(newDisto, this.BuVO);
                        }
                    }
                }
            });

            waveSeqs.ForEach(waveSeq =>
            {
                var souWaveDistos = ADO.DistoADO.GetInstant().ListBySouWaveSeq(waveSeq.ID.Value, this.BuVO);
                if (souWaveDistos.TrueForAll(x => x.Status == EntityStatus.ACTIVE))
                {
                    waveSeq.EventStatus = WaveEventStatus.WORKED;
                    waveSeq.Status = EntityStatus.ACTIVE;
                    ADO.WaveADO.GetInstant().PutSeq(waveSeq, this.BuVO);

                    var souSto = souWaveDistos.Select(x => x.Sou_StorageObject_ID).Distinct().ToList();
                    souSto.ForEach(x =>
                    {
                        var bsto = ADO.StorageObjectADO.GetInstant().Get(x, StorageObjectType.PACK, true, true, this.BuVO);
                        if(bsto != null)
                        {
                            var findBase = bsto.ToTreeList().Find(y => y.type == StorageObjectType.BASE);
                            if(findBase.eventStatus == waveSeq.Start_StorageObject_EventStatus)
                            {
                                ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(findBase.id.Value, waveSeq.Start_StorageObject_EventStatus, null, StorageObjectEventStatus.RECEIVED, this.BuVO);
                            }
                        }
                    });

                    if (waveSeq.AutoNextSeq == 1)
                    {
                        var nextWaveSeq = new NextDistoWaveSeq();
                        var nextReq = new NextDistoWaveSeq.TReq()
                        {
                            CurrentDistoIDs = souWaveDistos.Select(x => x.ID.Value).ToList(),
                        };
                        nextWaveSeq.Execute(this.Logger, this.BuVO, nextReq);
                    }
                }
            });

            return new TRes()
            {
                distos = distos,
                waveSeqs = waveSeqs
            };
        }

        private StorageObjectCriteria MapPackToBase(amt_StorageObject souPsto, decimal pickQty, amt_DocumentItemStorageObject disto, 
            StorageObjectCriteria souBsto, StorageObjectCriteria desBsto, ams_AreaLocationMaster location, TReq.DistoList reqData, amt_WaveSeq waveSeq)
        {
            if (pickQty == 0)
            {
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ใส่สามารถใส่จำนวนเป็น 0 ได้");
            }

            var remainQty = StaticValue.ConvertToNewUnitByPack(souPsto.PackMaster_ID, souPsto.Quantity - pickQty, disto.UnitType_ID, disto.BaseUnitType_ID).baseQty;

            var oldPack = desBsto.ToTreeList().Find(x => x.batch == souPsto.Batch
                && x.mstID == souPsto.PackMaster_ID
                && x.lot == souPsto.Lot
                && x.orderNo == souPsto.OrderNo
                && x.expiryDate == souPsto.ExpiryDate
                && x.productDate == souPsto.ProductDate);

            var updatePsto = souBsto.ToTreeList().Find(x => x.id == souPsto.ID);

            if (remainQty != 0)
            {
                if (oldPack != null)
                {
                    oldPack.baseQty = StaticValue.ConvertToNewUnitByPack(souPsto.PackMaster_ID, oldPack.qty + pickQty, disto.UnitType_ID, disto.BaseUnitType_ID).baseQty;
                    oldPack.qty = oldPack.qty + pickQty;
                    ADO.StorageObjectADO.GetInstant().PutV2(oldPack, this.BuVO);

                    return oldPack;
                }
                else
                {
                    updatePsto.baseQty = StaticValue.ConvertToNewUnitByPack(souPsto.PackMaster_ID, updatePsto.qty - pickQty, disto.UnitType_ID, disto.BaseUnitType_ID).baseQty;
                    updatePsto.qty = updatePsto.qty - pickQty;
                    ADO.StorageObjectADO.GetInstant().PutV2(updatePsto, this.BuVO);

                    var newPsto = updatePsto.Clone();
                    newPsto.id = null;
                    newPsto.baseQty = StaticValue.ConvertToNewUnitByPack(souPsto.PackMaster_ID, pickQty, disto.UnitType_ID, disto.BaseUnitType_ID).baseQty;
                    newPsto.qty = pickQty;
                    newPsto.parentID = desBsto.id;
                    newPsto.parentType = desBsto.type;
                    newPsto.eventStatus = waveSeq.End_StorageObject_EventStatus;
                    var resStoID = ADO.StorageObjectADO.GetInstant().PutV2(newPsto, this.BuVO);
                    newPsto.id = resStoID;
                    return newPsto;
                }
            }
            else
            {
                if (reqData.baseCode != souBsto.code)
                {
                    updatePsto.parentID = desBsto.id;
                    updatePsto.parentType = desBsto.type;
                    updatePsto.eventStatus = waveSeq.End_StorageObject_EventStatus;
                    ADO.StorageObjectADO.GetInstant().PutV2(updatePsto, this.BuVO);

                    var checkBsto = ADO.StorageObjectADO.GetInstant().Get(souBsto.id.Value, StorageObjectType.BASE, false, true, this.BuVO);
                    if (checkBsto.mapstos == null)
                        ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(checkBsto.id.Value, null, null, StorageObjectEventStatus.REMOVED, this.BuVO);
                }
                else
                {
                    if (souBsto.mapstos.Count > 1)
                    {
                        throw new AMWException(this.Logger, AMWExceptionCode.V1001, "จำนวนสินค้าใน Base มากกว่า 1 SKU ไม่สามารถหยิบทั้ง Pallet ได้");
                    }
                    else
                    {
                        ADO.StorageObjectADO.GetInstant().UpdateLocationToChild(souBsto, location.ID.Value, this.BuVO);
                        ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(souBsto.id.Value, null, null, waveSeq.End_StorageObject_EventStatus, this.BuVO);
                    }
                }
                return updatePsto;
            }
        }

        private StorageObjectCriteria MapBase(string baseCode, long? areaID, long? locationID)
        {
            ams_AreaLocationMaster baseLocation = ADO.DataADO.GetInstant().SelectByCodeActive<ams_AreaLocationMaster>(baseCode, this.BuVO);
            if(baseCode != null)
                return ADO.StorageObjectADO.GetInstant().Get(baseCode, null, areaID, false, true, this.BuVO);

            var AutoPallet = StaticValue.IsFeature("AutoPallet");
            if (AutoPallet)
            {
                var _base = AWMSEngine.ADO.DataADO.GetInstant().SelectByCodeActive<ams_BaseMaster>(baseCode, this.BuVO);

                if (_base == null)
                {
                    var BaseMasterType = StaticValueManager.GetInstant().BaseMasterTypes.FirstOrDefault();

                    ams_BaseMaster newBase = new ams_BaseMaster()
                    {
                        Code = baseCode,
                        ObjectSize_ID = BaseMasterType.ObjectSize_ID,
                        UnitType_ID = BaseMasterType.UnitType_ID,
                        Name = BaseMasterType.Name,
                        WeightKG = BaseMasterType.Weight,
                        BaseMasterType_ID = BaseMasterType.ID.Value,
                        Status = EntityStatus.ACTIVE
                    };

                    var resID = AWMSEngine.ADO.DataADO.GetInstant().Insert<ams_BaseMaster>(this.BuVO, newBase);
                    newBase.ID = resID;

                    var _unitType = StaticValueManager.GetInstant().UnitTypes.FirstOrDefault(x => x.ID == _base.UnitType_ID);
                    var _objSize = StaticValueManager.GetInstant().ObjectSizes.FirstOrDefault(x => x.ObjectType == StorageObjectType.BASE);

                    var _area = StaticValueManager.GetInstant().AreaMasters.FirstOrDefault(x => x.ID == areaID);
                    StorageObjectCriteria baseSto = new StorageObjectCriteria()
                    {
                        code = baseCode,
                        eventStatus = StorageObjectEventStatus.NEW,
                        name = "Pallet",
                        qty = 1,
                        unitCode = _unitType.Code,
                        unitID = _unitType.ID.Value,
                        baseUnitCode = _unitType.Code,
                        baseUnitID = _unitType.ID.Value,
                        baseQty = 1,
                        objectSizeID = _objSize.ID.Value,
                        type = StorageObjectType.BASE,
                        mstID = _base.ID.Value,
                        objectSizeName = _objSize.Name,
                        areaID = _area.ID,
                        warehouseID = _area.Warehouse_ID.Value,
                        parentID = locationID
                    };

                    var baseStoID = AWMSEngine.ADO.StorageObjectADO.GetInstant().PutV2(baseSto, this.BuVO);
                }
                else
                {
                    var sto = ADO.StorageObjectADO.GetInstant().Get(baseCode, null, areaID, false, true, this.BuVO);
                    if (sto.areaID != areaID || sto.parentID != locationID)
                        throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Base Code : " + baseCode + "ไม่ตรงกับตำแหน่งที่ปัจจุบัน");

                    if (sto == null)
                    {
                        var _unitType = StaticValueManager.GetInstant().UnitTypes.FirstOrDefault(x => x.ID == _base.UnitType_ID);
                        var _objSize = StaticValueManager.GetInstant().ObjectSizes.FirstOrDefault(x => x.ObjectType == StorageObjectType.BASE);

                        var _area = StaticValueManager.GetInstant().AreaMasters.FirstOrDefault(x => x.ID == areaID);
                        StorageObjectCriteria baseSto = new StorageObjectCriteria()
                        {
                            code = baseCode,
                            eventStatus = StorageObjectEventStatus.NEW,
                            name = "Pallet",
                            qty = 1,
                            unitCode = _unitType.Code,
                            unitID = _unitType.ID.Value,
                            baseUnitCode = _unitType.Code,
                            baseUnitID = _unitType.ID.Value,
                            baseQty = 1,
                            objectSizeID = _objSize.ID.Value,
                            type = StorageObjectType.BASE,
                            mstID = _base.ID.Value,
                            objectSizeName = _objSize.Name,
                            areaID = _area.ID,
                            warehouseID = _area.Warehouse_ID.Value,
                            parentID = locationID
                        };

                        var baseStoID = AWMSEngine.ADO.StorageObjectADO.GetInstant().PutV2(baseSto, this.BuVO);
                    }
                }

                var res = ADO.StorageObjectADO.GetInstant().Get(baseCode, null, areaID, false, true, this.BuVO);

                return res;
            }
            else
            {
                var _base = AWMSEngine.ADO.DataADO.GetInstant().SelectByCodeActive<ams_BaseMaster>(baseCode, this.BuVO);

                if (_base == null)
                {
                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบ Base Master");
                }
                else
                {
                    var sto = ADO.StorageObjectADO.GetInstant().Get(baseCode, null, areaID, false, true, this.BuVO);
                    if (sto.areaID != areaID)
                        throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Base Code : " + baseCode + "ไม่ตรงกับตำแหน่งที่ปัจจุบัน");

                    if (sto == null)
                    {
                        var _unitType = StaticValueManager.GetInstant().UnitTypes.FirstOrDefault(x => x.ID == _base.UnitType_ID);
                        var _objSize = StaticValueManager.GetInstant().ObjectSizes.FirstOrDefault(x => x.ObjectType == StorageObjectType.BASE);

                        var _area = StaticValueManager.GetInstant().AreaMasters.FirstOrDefault(x => x.ID == areaID);
                        StorageObjectCriteria baseSto = new StorageObjectCriteria()
                        {
                            code = baseCode,
                            eventStatus = StorageObjectEventStatus.NEW,
                            name = "Pallet",
                            qty = 1,
                            unitCode = _unitType.Code,
                            unitID = _unitType.ID.Value,
                            baseUnitCode = _unitType.Code,
                            baseUnitID = _unitType.ID.Value,
                            baseQty = 1,
                            objectSizeID = _objSize.ID.Value,
                            type = StorageObjectType.BASE,
                            mstID = _base.ID.Value,
                            objectSizeName = _objSize.Name,
                            areaID = _area.ID,
                            warehouseID = _area.Warehouse_ID.Value,
                            parentID = locationID
                        };

                        var baseStoID = AWMSEngine.ADO.StorageObjectADO.GetInstant().PutV2(baseSto, this.BuVO);
                    }
                }
                var res = ADO.StorageObjectADO.GetInstant().Get(baseCode, null, areaID, false, true, this.BuVO);

                return res;
            }
        }
    }
}
