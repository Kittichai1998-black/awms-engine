using AMWUtil.Logger;
using AWMSEngine.Engine; 
using AWMSModel.Constant.EnumConst;
using AWMSEngine.Engine.V2.Business.WorkQueue;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Exception;
using AWMSEngine.Common;
using AMWUtil.Common;
using AWMSModel.Criteria.SP.Request;
using AWMSEngine.ADO.StaticValue;
using AWMSModel.Criteria.SP.Response;
using AWMSModel.Constant.StringConst;
using AWMSEngine.Engine.V2.Business.Document;

namespace ProjectBOSS.Engine.WorkQueue
{
    public class RegisterWorkQueue_CoutingAuto : IProjectEngine<RegisterWorkQueue.TReq, WorkQueueCriteria>
    {
        private ams_AreaMaster _areaASRS;
        private ams_AreaLocationMaster _locationASRS;
        private ams_Warehouse _warehouseASRS;
        private ams_Branch _branchASRS;

        private StaticValueManager StaticValue;
        private void InitDataASRS(RegisterWorkQueue.TReq reqVO, AMWLogger Logger, VOCriteria BuVO)
        {
            this._warehouseASRS = StaticValue.Warehouses.FirstOrDefault(x => x.Code == reqVO.warehouseCode);
            this._branchASRS = StaticValue.Branchs.FirstOrDefault(x => x.ID == _warehouseASRS.Branch_ID);
            this._areaASRS = StaticValue.AreaMasters.FirstOrDefault(x => x.Code == reqVO.areaCode && x.Warehouse_ID == _warehouseASRS.ID);
            this._locationASRS = AWMSEngine.ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_AreaLocationMaster>(
                new KeyValuePair<string, object>[] {
                    new KeyValuePair<string,object>("Code",reqVO.locationCode),
                    new KeyValuePair<string,object>("AreaMaster_ID",_areaASRS.ID.Value),
                    new KeyValuePair<string,object>("Status", EntityStatus.ACTIVE)
                }, BuVO).FirstOrDefault();
        }
        public WorkQueueCriteria ExecuteEngine(AMWLogger Logger, VOCriteria BuVO, RegisterWorkQueue.TReq reqVO)
        {
            if (reqVO.areaCode != "CT" && reqVO.locationCode != "G05")
                return null;
            
            StaticValue = AWMSEngine.ADO.StaticValue.StaticValueManager.GetInstant();
            var res = new WorkQueueCriteria();

            try
            {
                this.InitDataASRS(reqVO, Logger, BuVO);
                var sto = GetSto(reqVO, Logger, BuVO);
                if (sto != null)
                {
                    
                    try
                    {
                        this.SetWeiChildAndUpdateInfoToChild(sto, reqVO.weight ?? 0, Logger, BuVO);
                        this.UpdatePIDocument(sto, Logger, BuVO);
                    }
                    catch (AMWException ex)
                    {
                        sto.options = ObjectUtil.QryStrSetValue(sto.options,
                           new KeyValuePair<string, object>[] {
                               new KeyValuePair<string, object>(OptionVOConst.OPT_ERROR_COUNTING, "NOT PASS"),
                               new KeyValuePair<string, object>(OptionVOConst.OPT_ERROR, ex.Message)
                           });

                    }
                    finally {
                        var DISTOs = GetDISTO(sto, reqVO, Logger, BuVO);
                        var desLocation = this.GetDesLocations(sto, reqVO, Logger, BuVO);
                        var queueTrx = this.CreateWorkQueue(sto, desLocation, reqVO, BuVO);

                        DISTOs.ForEach(disto =>
                        {
                            AWMSEngine.ADO.WMSDB.DistoADO.GetInstant().Update(disto.ID.Value, queueTrx.ID.Value, EntityStatus.INACTIVE, BuVO);
                        });
                        var register = new RegisterWorkQueue();

                        res = register.GenerateResponse(sto, queueTrx, BuVO, StaticValue);
                        var LocationCondition = AWMSEngine.ADO.WMSDB.StorageObjectADO.GetInstant().ListLocationCondition(new List<long> { sto.id.Value }, BuVO).FirstOrDefault();
                        res.locationBankNumRange = LocationCondition.LocationBankNumRange;
                        res.locationBayNumRange = LocationCondition.LocationBayNumRange;
                        res.locationLvNumRange = LocationCondition.LocationLvNumRange;
                            
                        
                    }
                    return res;
                }
                else
                {
                    return res;
                }
            }
            catch (Exception ex)
            {
                return res;
            }

        }

        private void UpdatePIDocument(StorageObjectCriteria sto, AMWLogger Logger, VOCriteria BuVO)
        {
            var packs = sto.ToTreeList().FindAll(x => x.type == StorageObjectType.PACK && x.eventStatus == StorageObjectEventStatus.COUNTING);

            var docItemIDs = new List<long>();
            packs.ForEach(pack => {
                var getDisto = AWMSEngine.ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(new SQLConditionCriteria[]
                    {
                        new SQLConditionCriteria("Sou_StorageObject_ID", pack.id, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("Status", EntityStatus.INACTIVE, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("DocumentType_ID", DocumentTypeID.PHYSICAL_COUNT, SQLOperatorType.EQUALS),
                    }, BuVO).First();
                getDisto.Status = EntityStatus.DONE;
                getDisto.Des_StorageObject_ID = pack.id.Value;
                getDisto.Quantity = pack.qty;
                getDisto.BaseQuantity = pack.baseQty;

                AWMSEngine.ADO.WMSDB.DistoADO.GetInstant().Update(getDisto, BuVO);
                docItemIDs.Add(getDisto.DocumentItem_ID.Value);
            });

            //var getPIDoc = AWMSEngine.ADO.WMSDB.DocumentADO.GetInstant().ListBySTO(packs.Select(x => x.id.Value).ToList(), DocumentTypeID.PHYSICAL_COUNT, BuVO).Select(y=>y.ID.Value).ToList();
            var documents = AWMSEngine.ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_DocumentItem>(
                new SQLConditionCriteria("ID", string.Join(",", docItemIDs.Distinct()), SQLOperatorType.EQUALS), BuVO);
            var resWorked = new WorkedDocument().Execute(Logger, BuVO,
               new WorkedDocument.TReq() { docIDs = documents.Select(x=> x.Document_ID).ToList() });

        }

        private List<amt_DocumentItemStorageObject> GetDISTO(StorageObjectCriteria sto, RegisterWorkQueue.TReq reqVO, AMWLogger Logger, VOCriteria BuVO)
        {
            var packs = sto.ToTreeList().FindAll(x => x.type == StorageObjectType.PACK);
             
            List<amt_DocumentItemStorageObject> listDiSTO = new List<amt_DocumentItemStorageObject>();
            packs.ForEach(pack =>
            {
                var disto = new amt_DocumentItemStorageObject
                {
                    ID = null,
                    DocumentItem_ID = null,
                    Sou_StorageObject_ID = pack.id.Value,
                    Des_StorageObject_ID = pack.id.Value,
                    Quantity = pack.qty,
                    BaseQuantity = pack.baseQty,
                    UnitType_ID = pack.unitID,
                    BaseUnitType_ID = pack.baseUnitID,
                    Status = EntityStatus.INACTIVE
                };

                var distoID = AWMSEngine.ADO.WMSDB.DistoADO.GetInstant().Insert(disto, BuVO);
                listDiSTO.Add(distoID);
            });
            return listDiSTO;
        }

        private StorageObjectCriteria GetSto(RegisterWorkQueue.TReq reqVO, AMWLogger Logger, VOCriteria BuVO)
        {
            var sto = AWMSEngine.ADO.WMSDB.StorageObjectADO.GetInstant().Get(reqVO.baseCode,
                         null, null, false, true, BuVO);
            if (sto != null)
            {
                var stopack = sto.ToTreeList().Where(x => x.type == StorageObjectType.PACK).ToList();
                if (stopack == null || stopack.Count == 0)
                    throw new AMWException(Logger, AMWExceptionCode.V1001, "Data of Packs Not Found");


                sto.lengthM = reqVO.length;
                sto.heightM = reqVO.height;
                sto.widthM = reqVO.width;
                sto.warehouseID = _warehouseASRS.ID.Value;
                sto.areaID = _areaASRS.ID.Value;
                sto.parentID = _locationASRS.ID.Value;
                sto.parentType = StorageObjectType.LOCATION;
                return sto;
            }
            else
            {
                return null;
            }
            
        }

        private void SetWeiChildAndUpdateInfoToChild(StorageObjectCriteria sto, decimal totalWeiKG, AMWLogger Logger, VOCriteria BuVO)
        {
            var stoTreeList = sto.ToTreeList();
            var packMasters = AWMSEngine.ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_PackMaster>(
                new SQLConditionCriteria(
                    "ID",
                    string.Join(',', stoTreeList.Where(x => x.type == StorageObjectType.PACK).Select(x => x.mstID.Value).Distinct().ToArray()),
                    SQLOperatorType.IN),
                BuVO);
            var baseMasters = AWMSEngine.ADO.WMSDB.DataADO.GetInstant().SelectByID<ams_BaseMaster>(stoTreeList.Where(x => x.type == StorageObjectType.BASE).FirstOrDefault().mstID.Value, BuVO);
            //*****SET WEI CODING
            var oldPallet_WeiKG = sto.weiKG;
            var percentWei = StaticValue.GetConfigValue<string>(ConfigCommon.PERCENT_WEIGHT_AUTO);
            var stdWeiRange = decimal.Parse(percentWei) * oldPallet_WeiKG;
            var stdWeiStart = totalWeiKG - stdWeiRange;
            var stdWeiEnd = totalWeiKG + stdWeiRange;
            sto.weiKG = totalWeiKG;
            sto.eventStatus = StorageObjectEventStatus.RECEIVING;
            if (!totalWeiKG.IsBetween(stdWeiStart, stdWeiEnd))
            {
                sto.options = ObjectUtil.QryStrSetValue(sto.options,
                       new KeyValuePair<string, object>[] {
                           new KeyValuePair<string, object>(OptionVOConst.OPT_ERROR_COUNTING, "NOT PASS"),
                           new KeyValuePair<string, object>(OptionVOConst.OPT_OLD_WEIGHT, oldPallet_WeiKG)
                       });

            }
            else
            {
                sto.options = ObjectUtil.QryStrSetValue(sto.options,
                     new KeyValuePair<string, object>[] {
                           new KeyValuePair<string, object>(OptionVOConst.OPT_ERROR_COUNTING, "PASS"),
                           new KeyValuePair<string, object>(OptionVOConst.OPT_OLD_WEIGHT, oldPallet_WeiKG)
                     });
            }
            var innerTotalWeiKG = (totalWeiKG - (baseMasters.WeightKG)) ?? 1;

            List<decimal> precenFromTotalWeis = new List<decimal>();
            decimal totalWeiStd = packMasters.Sum(x => (x.WeightKG ?? 0) * sto.mapstos.Where(y => y.type == StorageObjectType.PACK && y.mstID == x.ID).Sum(y => y.qty));
            totalWeiStd = totalWeiStd == 0 ? 1 : totalWeiStd;

            sto.mapstos.FindAll(x => x.type == StorageObjectType.PACK).ForEach(stos =>
            {
                decimal percentWeiStd =
                (
                    (packMasters.First(x => x.ID == stos.mstID).WeightKG ?? 1) * stos.qty
                ) / totalWeiStd;
                stos.weiKG = percentWeiStd * innerTotalWeiKG;
            });

            long areaID = sto.areaID.Value;
            stoTreeList.ForEach(x =>
            {
                x.areaID = areaID;
                AWMSEngine.ADO.WMSDB.StorageObjectADO.GetInstant().PutV2(x, BuVO);
            });

        }
        private SPOutAreaLineCriteria GetDesLocations(StorageObjectCriteria sto, RegisterWorkQueue.TReq reqVO, AMWLogger Logger, VOCriteria BuVO)
        {
            SPOutAreaLineCriteria res = null;
            if (res == null)
            {
                if (string.IsNullOrWhiteSpace(reqVO.desAreaCode))
                {
                    var desLocations = AWMSEngine.ADO.WMSDB.AreaADO.GetInstant().ListDestinationArea(reqVO.ioType, sto.areaID.Value, sto.parentID, BuVO);
                    res = desLocations.OrderByDescending(x => x.DefaultFlag).FirstOrDefault();
                }
                else
                {
                    var area = _areaASRS; //this.StaticValue.AreaMasters.FirstOrDefault(x => x.Code == reqVO.areaCode);
                    var desArea = this.StaticValue.AreaMasters.FirstOrDefault(x => x.Code == reqVO.desAreaCode);
                    var location = _locationASRS; // ADO.WMSDB.DataADO.GetInstant().SelectByCodeActive<ams_AreaLocationMaster>(reqVO.locationCode, this.BuVO);
                    var desLocation = AWMSEngine.ADO.WMSDB.DataADO.GetInstant().SelectByCodeActive<ams_AreaLocationMaster>(reqVO.desLocationCode, BuVO);
                    res = new SPOutAreaLineCriteria()
                    {
                        Sou_AreaMasterType_ID = area.AreaMasterType_ID,
                        //Sou_AreaMasterType_Code = this.StaticValue.AreaMasterTypes.FirstOrDefault(x => x.ID == area.AreaMasterType_ID).Code,
                        //Sou_AreaMasterType_GroupType = this.StaticValue.AreaMasterTypes.FirstOrDefault(x => x.ID == area.AreaMasterType_ID).groupType,
                        Sou_AreaMaster_ID = area.ID.Value,
                        Sou_AreaMaster_Code = area.Code,
                        Sou_AreaLocationMaster_ID = location.ID,
                        Sou_AreaLocationMaster_Code = location.Code,
                        Des_AreaMasterType_ID = desArea.AreaMasterType_ID,
                        //Des_AreaMasterType_Code = this.StaticValue.AreaMasterTypes.FirstOrDefault(x => x.ID == desArea.AreaMasterType_ID).Code,
                        //Des_AreaMasterType_GroupType = this.StaticValue.AreaMasterTypes.FirstOrDefault(x => x.ID == desArea.AreaMasterType_ID).groupType,
                        Des_AreaMaster_ID = desArea.ID.Value,
                        Des_AreaMaster_Code = reqVO.desAreaCode,
                        Des_AreaLocationMaster_ID = desLocation.ID,
                        Des_AreaLocationMaster_Code = reqVO.desLocationCode,
                        DefaultFlag = YesNoFlag.No,
                        Condition_Eval = null



                    };
                }
            }
            return res;
        }

        private SPworkQueue CreateWorkQueue(StorageObjectCriteria sto, SPOutAreaLineCriteria location, RegisterWorkQueue.TReq reqVO, VOCriteria BuVO)
        {
            SPworkQueue workQ = new SPworkQueue()
            {
                ID = null,
                IOType = reqVO.ioType,
                ActualTime = reqVO.actualTime,
                Parent_WorkQueue_ID = null,
                Priority = 1,
                TargetStartTime = null,

                StorageObject_ID = sto.id,
                StorageObject_Code = sto.code,

                Warehouse_ID = _warehouseASRS.ID.Value,
                AreaMaster_ID = _areaASRS.ID.Value,
                AreaLocationMaster_ID = _locationASRS.ID.Value,


                Sou_Warehouse_ID = _warehouseASRS.ID.Value,
                Sou_AreaMaster_ID = _areaASRS.ID.Value,
                Sou_AreaLocationMaster_ID = _locationASRS.ID.Value,

                Des_Warehouse_ID = this.StaticValue.AreaMasters.First(x => x.ID == location.Des_AreaMaster_ID).Warehouse_ID.Value,
                Des_AreaMaster_ID = location.Des_AreaMaster_ID.Value,
                Des_AreaLocationMaster_ID = location.Des_AreaLocationMaster_ID,

                EventStatus = WorkQueueEventStatus.WORKING,
                Status = EntityStatus.ACTIVE,
                StartTime = reqVO.actualTime 
            };
            workQ = AWMSEngine.ADO.WMSDB.WorkQueueADO.GetInstant().PUT(workQ, BuVO);
            return workQ;
        }
    }
}
