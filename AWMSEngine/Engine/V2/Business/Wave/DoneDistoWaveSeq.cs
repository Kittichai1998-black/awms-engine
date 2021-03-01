using AMWUtil.Common;
using AMWUtil.Exception;
using ADO.WMSStaticValue;
using AMSModel.Constant.EnumConst;
using AMSModel.Criteria;
using AMSModel.Criteria.SP.Request;
using AMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.Wave
{
    public class DoneDistoWaveSeq : BaseEngine<DoneDistoWaveSeq.TReq, DoneDistoWaveSeq.TRes>
    {
        public class TReq
        {
            public List<DistoList> distos;
            public class DistoList
            {
                public long distoID;
                //Destination Base
                public string baseCode;
                //Current Location
                public string locationCode;
                public decimal? baseQty;
                public bool limitQty = true;
            }
        }
        public class TRes
        {
            public List<amt_DocumentItemStorageObject> distos;
            public amt_WaveSeq waveSeq;
        }
        protected override TRes ExecuteEngine(TReq reqVO)
        {
            var distoList = new List<amt_DocumentItemStorageObject>();
            var wavList = new List<amt_Wave>();
            var distos = ADO.WMSDB.DistoADO.GetInstant().GetListDisto(reqVO.distos.Select(x => x.distoID).ToList(), this.BuVO);
            if(distos.Count == 0)
                throw new AMWException(this.Logger, AMWExceptionCode.V1002, $"ไม่พบข้อมูลในการหยิบสินค้า");

            if (distos.Any(x => x.Status == EntityStatus.ACTIVE))
            {
                var findActive = distos.Find(x => x.Status == EntityStatus.ACTIVE);
                throw new AMWException(this.Logger, AMWExceptionCode.V1002, $"งานนี้ถูกทำงานแล้ว ไม่สามารถทำงานซ้ำได้ ID : {findActive.ID}");
            }

            var docItemIDs = distos.Select(x => x.DocumentItem_ID).Distinct().ToList();
            var documentItems = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_DocumentItem>(
                new SQLConditionCriteria[] { new SQLConditionCriteria("ID", string.Join(',', docItemIDs), SQLOperatorType.IN) },
                this.BuVO);

            var pstoIDs = distos.Select(x => x.Sou_StorageObject_ID).Distinct().ToList();
            var pstos = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_StorageObject>(
                new SQLConditionCriteria[] { new SQLConditionCriteria("ID", string.Join(',', pstoIDs), SQLOperatorType.IN) },
                this.BuVO);

            var waveSeq = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_WaveSeq>(
                new SQLConditionCriteria[] { 
                    new SQLConditionCriteria("ID", distos.First().Sou_WaveSeq_ID.Value, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("Status", EntityStatus.ACTIVE, SQLOperatorType.EQUALS) 
                },
                this.BuVO).FirstOrDefault();
            if (waveSeq == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบ Wave Sequence");

            distos.ForEach(disto =>
            {
                var req = reqVO.distos.Find(x => x.distoID == disto.ID);

                var souPsto = pstos.Find(x => x.ID == disto.Sou_StorageObject_ID);
                StorageObjectCriteria souBsto = new StorageObjectCriteria(), desBsto = new StorageObjectCriteria(), desSto = new StorageObjectCriteria();
                if (souPsto.ParentStorageObject_ID.HasValue)
                    souBsto = ADO.WMSDB.StorageObjectADO.GetInstant().Get(souPsto.ParentStorageObject_ID.Value, StorageObjectType.BASE, false, true, this.BuVO);

                var listItemInSouBase = souBsto.ToTreeList();
                ams_AreaLocationMaster location = new ams_AreaLocationMaster();

                var docItem = documentItems.Find(item => item.ID == disto.DocumentItem_ID);
                var distosSumQty = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(new SQLConditionCriteria[]
                {
                    new SQLConditionCriteria("DocumentItem_ID", docItem.ID, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("Sou_WaveSeq_ID", waveSeq.ID, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("Status", "0,1,3", SQLOperatorType.IN)
                }, this.BuVO).Sum(x => x.BaseQuantity);

                if (string.IsNullOrWhiteSpace(req.locationCode))
                {
                    if (souBsto != null)
                    {
                        location = ADO.WMSDB.DataADO.GetInstant().SelectByID<ams_AreaLocationMaster>(souBsto.parentID, this.BuVO);
                    }
                    else if (disto.WorkQueue_ID.HasValue)
                    {
                        var wq = ADO.WMSDB.WorkQueueADO.GetInstant().Get(disto.WorkQueue_ID.Value, this.BuVO);
                        location = ADO.WMSDB.DataADO.GetInstant().SelectByID<ams_AreaLocationMaster>(wq.Des_AreaLocationMaster_ID, this.BuVO);
                    }
                }
                else
                    location = ADO.WMSDB.DataADO.GetInstant().SelectByCodeActive<ams_AreaLocationMaster>(req.locationCode, this.BuVO);

                if (string.IsNullOrWhiteSpace(req.baseCode) || (req.baseCode == souBsto.code))
                {
                    desBsto = souBsto;
                }
                else
                {
                    desBsto = MapBase(req.baseCode, location.AreaMaster_ID, location.ID);
                }

                if(waveSeq.End_StorageObject_EventStatus == StorageObjectEventStatus.PACK_ALLOCATED)
                {
                    ADO.WMSDB.DistoADO.GetInstant().Update(disto.ID.Value, EntityStatus.ACTIVE, this.BuVO);
                    ADO.WMSDB.StorageObjectADO.GetInstant().UpdateStatusToChild(souBsto.id.Value, StorageObjectEventStatus.PACK_ALLOCATING, null, StorageObjectEventStatus.PACK_ALLOCATED, this.BuVO);
                    disto.Status = EntityStatus.ACTIVE;
                }
                else
                {
                    var remainPick = docItem.ActualBaseQuantity - distosSumQty;
                    var souPstoCriteria = listItemInSouBase.Find(x => x.id == souPsto.ID);

                    desSto = MapPackToBase(souPstoCriteria, desBsto, disto, waveSeq, req.baseQty, remainPick, req);

                    if (desSto.parentID.HasValue)
                    {
                        var dBsto = ADO.WMSDB.StorageObjectADO.GetInstant().Get(desSto.parentID.Value, StorageObjectType.BASE, false, true, this.BuVO);
                        if(dBsto != null)
                        {
                            if (dBsto.mapstos.TrueForAll(x => x.eventStatus == waveSeq.End_StorageObject_EventStatus))
                            {
                                ADO.WMSDB.StorageObjectADO.GetInstant().UpdateStatusToChild(dBsto.id.Value, null, null, waveSeq.End_StorageObject_EventStatus, this.BuVO);
                            }
                        }
                    }
                }
            });

            var souWaveDistos = ADO.WMSDB.DistoADO.GetInstant().ListBySouWaveSeq(waveSeq.ID.Value, this.BuVO);

            //var prevWaveSeq = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_WaveSeq>(new SQLConditionCriteria[]{
            //    new SQLConditionCriteria("Seq", waveSeq.Seq - 1, SQLOperatorType.EQUALS),
            //    new SQLConditionCriteria("Wave_ID", waveSeq.Wave_ID, SQLOperatorType.EQUALS),
            //}, this.BuVO).FirstOrDefault();

            //if(prevWaveSeq != null)
            //{
            //    var prevWaveDisto = ADO.WMSDB.DistoADO.GetInstant().ListBySouWaveSeq(prevWaveSeq.ID.Value, this.BuVO);
            //    if (prevWaveDisto.TrueForAll(x => x.Status == EntityStatus.DONE) && souWaveDistos.TrueForAll(x => x.Status == EntityStatus.ACTIVE))
            //    {
            //        waveSeq.EventStatus = WaveEventStatus.WORKED;
            //        waveSeq.Status = EntityStatus.ACTIVE;
            //        ADO.WMSDB.WaveADO.GetInstant().PutSeq(waveSeq, this.BuVO);
            //    }
            //}
            //else
            //{
            //    if (souWaveDistos.TrueForAll(x => x.Status == EntityStatus.ACTIVE))
            //    {
            //        waveSeq.EventStatus = WaveEventStatus.WORKED;
            //        waveSeq.Status = EntityStatus.ACTIVE;
            //        ADO.WMSDB.WaveADO.GetInstant().PutSeq(waveSeq, this.BuVO);
            //    }
            //}

            NextWaveSeq(distos, souWaveDistos, waveSeq);

            return new TRes()
            {
                distos = distos,
                waveSeq = waveSeq
            };
        }

        private void NextWaveSeq(List<amt_DocumentItemStorageObject> currentDistos, List<amt_DocumentItemStorageObject> souWaveDistos, amt_WaveSeq waveSeq)
        {
            var souSto = souWaveDistos.Select(x => x.Sou_StorageObject_ID).Distinct().ToList();
            souSto.ForEach(x =>
            {
                var bsto = ADO.WMSDB.StorageObjectADO.GetInstant().Get(x, StorageObjectType.PACK, true, true, this.BuVO);
                if (bsto != null)
                {
                    var findSto = bsto.ToTreeList().Find(y => y.id == x);
                    var findBase = bsto.ToTreeList().Find(y => y.type == StorageObjectType.BASE && y.id == findSto.parentID);
                    if (findBase.eventStatus == waveSeq.Start_StorageObject_EventStatus)
                    {
                        ADO.WMSDB.StorageObjectADO.GetInstant().UpdateStatusToChild(findBase.id.Value, waveSeq.Start_StorageObject_EventStatus, null, StorageObjectEventStatus.PACK_RECEIVED, this.BuVO);
                    }
                }
            });

            if (waveSeq.AutoNextSeq)
            {
                var wave = ADO.WMSDB.WaveADO.GetInstant().Get(waveSeq.Wave_ID, this.BuVO);
                var nextWaveSeq = new NextDistoWaveSeq();
                var nextReq = new NextDistoWaveSeq.TReq()
                {
                    CurrentDistoIDs = currentDistos.Select(x => x.ID.Value).ToList(),
                    DesAreaID = wave.Des_Area_ID
                };
                nextWaveSeq.Execute(this.Logger, this.BuVO, nextReq);
            }
        }

        private StorageObjectCriteria GetDesFullSTO(amt_DocumentItemStorageObject disto, StorageObjectCriteria souPsto, StorageObjectCriteria desBsto, StorageObjectCriteria oldPack, amt_WaveSeq waveSeq)
        {
            if (oldPack != null && oldPack.id != souPsto.id)
            {
                oldPack.eventStatus = waveSeq.End_StorageObject_EventStatus;
                oldPack.baseQty += souPsto.baseQty;
                oldPack.qty += souPsto.qty;
                ADO.WMSDB.StorageObjectADO.GetInstant().PutV2(souPsto, this.BuVO);
                UpdateDisto(disto, oldPack, souPsto.qty, souPsto.baseQty);
                return oldPack;
            }
            else
            {
                souPsto.parentID = desBsto.id;
                souPsto.parentType = desBsto.type;
                souPsto.eventStatus = waveSeq.End_StorageObject_EventStatus;
                ADO.WMSDB.StorageObjectADO.GetInstant().PutV2(souPsto, this.BuVO);
                var findAllPack = desBsto.ToTreeList().FindAll(x => x.id != souPsto.id && x.type == StorageObjectType.PACK && x.eventStatus != waveSeq.End_StorageObject_EventStatus);
                if(findAllPack.Count == 0)
                {
                    ADO.WMSDB.StorageObjectADO.GetInstant().UpdateStatusToChild(desBsto.id.Value, waveSeq.Start_StorageObject_EventStatus, null, waveSeq.End_StorageObject_EventStatus, this.BuVO);
                }
                UpdateDisto(disto, souPsto, souPsto.qty, souPsto.baseQty);
                return souPsto;
            }
        }

        private void UpdateDisto(amt_DocumentItemStorageObject disto, StorageObjectCriteria desSto, decimal qty, decimal baseQty)
        {
            if(disto.Quantity == null)
                disto.Quantity = qty;

            if (disto.BaseQuantity == null)
                disto.BaseQuantity = baseQty;
            disto.Status = EntityStatus.ACTIVE;
            disto.Des_StorageObject_ID = desSto.id.Value;
            ADO.WMSDB.DistoADO.GetInstant().Update(disto.ID.Value, disto.Des_StorageObject_ID, disto.Quantity, disto.BaseQuantity, EntityStatus.ACTIVE, this.BuVO);
        }
        private void InsertDisto(amt_DocumentItemStorageObject disto, StorageObjectCriteria desSto, decimal qty, decimal baseQty, decimal remainQty)
        {
            disto.Quantity = qty;
            disto.BaseQuantity = baseQty;
            disto.Status = EntityStatus.ACTIVE;
            disto.Des_StorageObject_ID = desSto.id.Value;
            ADO.WMSDB.DistoADO.GetInstant().Update(disto.ID.Value, disto.Des_StorageObject_ID, disto.Quantity, disto.BaseQuantity, EntityStatus.ACTIVE, this.BuVO);

            if (remainQty - baseQty > 0)
            {
                var newDisto = disto.Clone();
                newDisto.ID = null;
                newDisto.Des_StorageObject_ID = null;
                newDisto.Quantity = null;
                newDisto.BaseQuantity = null;
                newDisto.Status = EntityStatus.INACTIVE;
                ADO.WMSDB.DistoADO.GetInstant().Insert(newDisto, this.BuVO);
            }
        }
        private StorageObjectCriteria GetDesPatialSTO(amt_DocumentItemStorageObject disto, StorageObjectCriteria souPsto, StorageObjectCriteria desBsto, StorageObjectCriteria oldPack, amt_WaveSeq waveSeq, decimal baseQty, decimal remainQty)
        {
            var convertQty = StaticValue.ConvertToNewUnitByPack(souPsto.mstID.Value, baseQty, disto.BaseUnitType_ID, disto.UnitType_ID);
            if (oldPack != null && oldPack.id != souPsto.id)
            {
                oldPack.eventStatus = waveSeq.End_StorageObject_EventStatus;
                oldPack.baseQty += baseQty;
                oldPack.qty += convertQty.newQty;
                ADO.WMSDB.StorageObjectADO.GetInstant().PutV2(oldPack, this.BuVO);

                souPsto.baseQty -= baseQty;
                souPsto.qty -= convertQty.newQty;
                if (souPsto.baseQty == 0)
                {
                    souPsto.eventStatus = StorageObjectEventStatus.PACK_REMOVED;
                }

                ADO.WMSDB.StorageObjectADO.GetInstant().PutV2(souPsto, this.BuVO);

                InsertDisto(disto, oldPack, baseQty, convertQty.newQty, remainQty);

                var souPackDisto = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(new SQLConditionCriteria[]
                {
                    new SQLConditionCriteria("Sou_StorageObject_ID", souPsto.id, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("Sou_WaveSeq_ID", waveSeq.ID, SQLOperatorType.EQUALS)
                }, this.BuVO);

                //if (souPackDisto.TrueForAll(x => x.Status == EntityStatus.ACTIVE))
                //    ADO.WMSDB.StorageObjectADO.GetInstant().UpdateStatusToChild(souPsto.parentID.Value, waveSeq.Start_StorageObject_EventStatus, null, StorageObjectEventStatus.RECEIVED, this.BuVO);

                ADO.WMSDB.StorageObjectADO.GetInstant().UpdateStatusToChild(oldPack.id.Value, null, null, waveSeq.End_StorageObject_EventStatus, this.BuVO);

                return oldPack;
            }
            else
            {
                var newPsto = souPsto.Clone();
                newPsto.id = null;
                newPsto.parentID = desBsto.id;
                newPsto.baseQty = baseQty;
                newPsto.qty = convertQty.newQty;
                newPsto.parentType = desBsto.type;
                newPsto.eventStatus = waveSeq.End_StorageObject_EventStatus;
                var resStoID = ADO.WMSDB.StorageObjectADO.GetInstant().PutV2(newPsto, this.BuVO);
                newPsto.id = resStoID;

                souPsto.baseQty -= baseQty;
                souPsto.qty -= convertQty.newQty;
                if (souPsto.baseQty == 0)
                {
                    souPsto.eventStatus = StorageObjectEventStatus.PACK_REMOVED;
                }
                ADO.WMSDB.StorageObjectADO.GetInstant().PutV2(souPsto, this.BuVO);

                InsertDisto(disto, newPsto, baseQty, convertQty.newQty, remainQty);

                var souPackDisto = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(new SQLConditionCriteria[]
                {
                    new SQLConditionCriteria("Sou_StorageObject_ID", souPsto.id, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("Sou_WaveSeq_ID", waveSeq.ID, SQLOperatorType.EQUALS)
                }, this.BuVO);

                //if (souPackDisto.TrueForAll(x => x.Status == EntityStatus.ACTIVE))
                //    ADO.WMSDB.StorageObjectADO.GetInstant().UpdateStatusToChild(souPsto.parentID.Value, waveSeq.Start_StorageObject_EventStatus, null, StorageObjectEventStatus.RECEIVED, this.BuVO);

                ADO.WMSDB.StorageObjectADO.GetInstant().UpdateStatusToChild(newPsto.id.Value, null, null, waveSeq.End_StorageObject_EventStatus, this.BuVO);


                return newPsto;
            }
        }

        private StorageObjectCriteria MapPackToBase(StorageObjectCriteria souPsto, StorageObjectCriteria desBsto,
            amt_DocumentItemStorageObject disto, amt_WaveSeq waveSeq, decimal? pickQty, decimal? canPick, TReq.DistoList req)
        {
            var oldPack = desBsto.ToTreeList().Find(x => x.batch == souPsto.batch
                    && x.mstID == souPsto.mstID
                    && x.lot == souPsto.lot
                    && x.orderNo == souPsto.orderNo
                    && x.expiryDate == souPsto.expiryDate
                    && x.productDate == souPsto.productDate
                    && x.eventStatus == waveSeq.End_StorageObject_EventStatus);

            if(canPick == 0)
            {
                ADO.WMSDB.StorageObjectADO.GetInstant().UpdateStatusToChild(souPsto.parentID.Value, waveSeq.Start_StorageObject_EventStatus, null, StorageObjectEventStatus.PACK_RECEIVED, this.BuVO);
                souPsto.eventStatus = StorageObjectEventStatus.PACK_RECEIVED;
                ADO.WMSDB.DistoADO.GetInstant().Update(disto.ID.Value, disto.Sou_StorageObject_ID, 0, 0, EntityStatus.DONE, this.BuVO);
                return souPsto;
            }
            else if (pickQty == null)
            {
                if (canPick >= souPsto.baseQty)
                {
                    var newPsto = GetDesFullSTO(disto, souPsto, desBsto, oldPack, waveSeq);
                    return newPsto;
                }
                else//ต้องเหลือสินค้าแน่นอน
                {
                    var newPsto = GetDesPatialSTO(disto, souPsto, desBsto, oldPack, waveSeq, canPick.Value, canPick.Value);
                    return newPsto;
                }
            }
            else if (pickQty > 0 && req.limitQty)
            {
                if (pickQty > canPick)
                    throw new AMWException(this.Logger, AMWExceptionCode.B0001, "สินค้าเกินจำนวนที่ต้องการ");

                if(pickQty > souPsto.baseQty)
                {
                    throw new AMWException(this.Logger, AMWExceptionCode.B0001, "สินค้ามีน้อยกว่าที่ต้องการ");
                }
                else if (pickQty == souPsto.baseQty)
                {
                    var newPsto = GetDesFullSTO(disto, souPsto, desBsto, oldPack, waveSeq);
                    return newPsto;
                }
                else
                {
                    var newPsto = GetDesPatialSTO(disto, souPsto, desBsto, oldPack, waveSeq, pickQty.Value, canPick.Value);
                    return newPsto;
                }
            }
            else if (pickQty > 0 && !req.limitQty)
            {
                if (pickQty > souPsto.baseQty)
                {
                    throw new AMWException(this.Logger, AMWExceptionCode.B0001, "สินค้ามีน้อยกว่าที่ต้องการ");
                }
                else if (pickQty == souPsto.baseQty)
                {
                    var newPsto = GetDesFullSTO(disto, souPsto, desBsto, oldPack, waveSeq);
                    return newPsto;
                }
                else
                {
                    var newPsto = GetDesPatialSTO(disto, souPsto, desBsto, oldPack, waveSeq, pickQty.Value, canPick.Value);
                    return newPsto;
                }
            }
            else
            {
                throw new AMWException(this.Logger, AMWExceptionCode.B0001, "จำนวนเป็น 0 ไม่สามารถเบิกของได้");
            }
        }

        private StorageObjectCriteria MapBase(string baseCode, long? areaID, long? locationID)
        {
            if (string.IsNullOrWhiteSpace(baseCode))
                return null;

            ams_AreaLocationMaster baseLocation = ADO.WMSDB.DataADO.GetInstant().SelectByCodeActive<ams_AreaLocationMaster>(baseCode, this.BuVO);
            if (baseCode != null)
                return ADO.WMSDB.StorageObjectADO.GetInstant().Get(baseCode, null, areaID, false, true, this.BuVO);

            var AutoPallet = StaticValue.GetConfigValue("MASTER.AUTO_CREATE_BASE").Get2<bool>();
            if (AutoPallet)
            {
                

                var _base = ADO.WMSDB.DataADO.GetInstant().SelectByCodeActive<ams_BaseMaster>(baseCode, this.BuVO);

                if (_base == null)
                {
                    var ObjectSizes_Default = StaticValueManager.GetInstant().ObjectSizes.Find(x => x.IsDefault == true && x.ObjectType == StorageObjectType.BASE);
                    var unitType = StaticValueManager.GetInstant().UnitTypes.Find(x => x.Code == "PL");

                    ams_BaseMaster newBase = new ams_BaseMaster()
                    {
                        Code = baseCode,
                        ObjectSize_ID = ObjectSizes_Default.ID.Value,
                        UnitType_ID = unitType.ID.Value,
                        Name = "Pallet",
                        Status = EntityStatus.ACTIVE
                    };

                    var resID = ADO.WMSDB.DataADO.GetInstant().Insert<ams_BaseMaster>(this.BuVO, newBase);
                    newBase.ID = resID;

                    var _unitType = StaticValueManager.GetInstant().UnitTypes.FirstOrDefault(x => x.ID == _base.UnitType_ID);
                    var _objSize = StaticValueManager.GetInstant().ObjectSizes.FirstOrDefault(x => x.ObjectType == StorageObjectType.BASE);

                    var _area = StaticValueManager.GetInstant().AreaMasters.FirstOrDefault(x => x.ID == areaID);
                    StorageObjectCriteria baseSto = new StorageObjectCriteria()
                    {
                        code = baseCode,
                        eventStatus = StorageObjectEventStatus.PACK_NEW,
                        name = "Pallet",
                        qty = 1,
                        unitCode = _unitType.Code,
                        unitID = _unitType.ID.Value,
                        baseUnitCode = _unitType.Code,
                        baseUnitID = _unitType.ID.Value,
                        baseQty = 1,
                        type = StorageObjectType.BASE,
                        mstID = _base.ID.Value,
                        areaID = _area.ID,
                        warehouseID = _area.Warehouse_ID.Value,
                        parentID = locationID
                    };

                    var baseStoID = ADO.WMSDB.StorageObjectADO.GetInstant().PutV2(baseSto, this.BuVO);
                }
                else
                {
                    var sto = ADO.WMSDB.StorageObjectADO.GetInstant().Get(baseCode, null, areaID, false, true, this.BuVO);
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
                            eventStatus = StorageObjectEventStatus.PACK_NEW,
                            name = "Pallet",
                            qty = 1,
                            unitCode = _unitType.Code,
                            unitID = _unitType.ID.Value,
                            baseUnitCode = _unitType.Code,
                            baseUnitID = _unitType.ID.Value,
                            baseQty = 1,
                            type = StorageObjectType.BASE,
                            mstID = _base.ID.Value,
                            areaID = _area.ID,
                            warehouseID = _area.Warehouse_ID.Value,
                            parentID = locationID
                        };

                        var baseStoID = ADO.WMSDB.StorageObjectADO.GetInstant().PutV2(baseSto, this.BuVO);
                    }
                }

                var res = ADO.WMSDB.StorageObjectADO.GetInstant().Get(baseCode, null, areaID, false, true, this.BuVO);

                return res;
            }
            else
            {
                var _base = ADO.WMSDB.DataADO.GetInstant().SelectByCodeActive<ams_BaseMaster>(baseCode, this.BuVO);

                if (_base == null)
                {
                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบ Base Master");
                }
                else
                {
                    var sto = ADO.WMSDB.StorageObjectADO.GetInstant().Get(baseCode, null, areaID, false, true, this.BuVO);
                    if (sto.areaID != areaID)
                        throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Base Code : " + baseCode + "ไม่ตรงกับตำแหน่งที่อยู่ปัจจุบัน");

                    if (sto == null)
                    {
                        var _unitType = StaticValueManager.GetInstant().UnitTypes.FirstOrDefault(x => x.ID == _base.UnitType_ID);
                        var _objSize = StaticValueManager.GetInstant().ObjectSizes.FirstOrDefault(x => x.ObjectType == StorageObjectType.BASE);

                        var _area = StaticValueManager.GetInstant().AreaMasters.FirstOrDefault(x => x.ID == areaID);
                        StorageObjectCriteria baseSto = new StorageObjectCriteria()
                        {
                            code = baseCode,
                            eventStatus = StorageObjectEventStatus.PACK_NEW,
                            name = "Pallet",
                            qty = 1,
                            unitCode = _unitType.Code,
                            unitID = _unitType.ID.Value,
                            baseUnitCode = _unitType.Code,
                            baseUnitID = _unitType.ID.Value,
                            baseQty = 1,
                            type = StorageObjectType.BASE,
                            mstID = _base.ID.Value,
                            areaID = _area.ID,
                            warehouseID = _area.Warehouse_ID.Value,
                            parentID = locationID
                        };

                        var baseStoID = ADO.WMSDB.StorageObjectADO.GetInstant().PutV2(baseSto, this.BuVO);
                    }
                }
                var res = ADO.WMSDB.StorageObjectADO.GetInstant().Get(baseCode, null, areaID, false, true, this.BuVO);

                return res;
            }
        }
    }
}
