using AMWUtil.Common;
using AMWUtil.Exception;
using AMWUtil.Logger;
using AWMSEngine.Engine;
using AWMSEngine.Engine.Business.Received;
using AWMSEngine.Engine.V2.Business;
using AWMSEngine.Engine.V2.Business.WorkQueue;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectTMC.Engine.WorkQueue
{
    public class RegisterWorkQueue_GetSTO : IProjectEngine<
        RegisterWorkQueue.TReq,
        StorageObjectCriteria
        >


    {
  
        public StorageObjectCriteria ExecuteEngine(AMWLogger logger, VOCriteria buVO, RegisterWorkQueue.TReq reqVO)
        {
            StorageObjectCriteria stos = new StorageObjectCriteria();
            //var StaticValue = AWMSEngine.ADO.StaticValue.StaticValueManager.GetInstant();
           
                if (reqVO.baseCode == null || reqVO.baseCode == "" || reqVO.baseCode == String.Empty)
                    throw new AMWException(logger, AMWExceptionCode.V1001, "Base Code is null");

                var baseMasterData = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<ams_BaseMaster>(
                    new KeyValuePair<string, object>[] {
                    new KeyValuePair<string,object>("Code",reqVO.baseCode),
                    new KeyValuePair<string,object>("Status",1),
                    }, buVO);


                if (baseMasterData.Count <= 0)
                {
                    //ไม่มีในระบบ insert เข้า baseMaster
                    AWMSEngine.ADO.DataADO.GetInstant().Insert<ams_BaseMaster>(buVO, new ams_BaseMaster()
                    {
                        Code = reqVO.baseCode,
                        Name = "Pallet",
                        BaseMasterType_ID = 6,
                        Description = "",
                        ObjectSize_ID = 4,
                        Status = EntityStatus.ACTIVE,
                        UnitType_ID = 2,
                        WeightKG = reqVO.weight
                    });
                }
            //==========================================================

            if (reqVO.mappingPallets != null && reqVO.mappingPallets.Count > 0)
            {
                foreach (var mappingPallet in reqVO.mappingPallets)
                {//Check Qty
                    if (reqVO.areaCode == "R")
                    {
                        //Inbound Zone
                        if(mappingPallet.qty <= 3)
                        {
                            stos = this.mapPallet(logger, reqVO, buVO);
                        }
                        else
                        {
                            throw new AMWException(logger, AMWExceptionCode.V1001, "Qty is greater than 3");
                        }
                      

                    }
                    else if (reqVO.areaCode == "FS")
                    {
                        //Outbound Zone
                        if (mappingPallet.qty <= 16)
                        {
                            stos = this.mapPallet(logger, reqVO, buVO);
                        }
                        else
                        {
                            throw new AMWException(logger, AMWExceptionCode.V1001, "Qty is greater than 3");
                        }
                    }

                }
                //=========================================================
            }
            else
            {
                //No mappingPallets

            }

            return stos;

        }
        private StorageObjectCriteria mapPallet(AMWLogger logger, RegisterWorkQueue.TReq dataMap, VOCriteria buVO)
        {
            // Map data to Table StorageObject
            var mapsto = new StorageObjectCriteria();

            var StaticValue = AWMSEngine.ADO.StaticValue.StaticValueManager.GetInstant();

            var Warehouses = StaticValue.Warehouses.FirstOrDefault(x => x.Code == dataMap.warehouseCode);
            if (Warehouses == null)
                throw new AMWException(logger, AMWExceptionCode.V1001, "Not Found Warehouse Code '" + dataMap.warehouseCode + "'");

            var area = StaticValue.AreaMasters.FirstOrDefault(x => x.Code == dataMap.areaCode && x.Warehouse_ID == Warehouses.ID);
            if (area == null)
                throw new AMWException(logger, AMWExceptionCode.V1001, "Not Found Area Code '" + dataMap.areaCode + "'");

            mapsto = AWMSEngine.ADO.StorageObjectADO.GetInstant().Get(dataMap.baseCode,
                null, null, false, true, buVO);

            var location = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<ams_AreaLocationMaster>(
                new KeyValuePair<string, object>[] {
                        new KeyValuePair<string,object>("Code",dataMap.locationCode),
                        new KeyValuePair<string,object>("AreaMaster_ID",area.ID.Value),
                        new KeyValuePair<string,object>("Status", EntityStatus.ACTIVE)
                }, buVO).FirstOrDefault();

            if (location == null)
                throw new AMWException(logger, AMWExceptionCode.V1001, "Not Found Location Code '" + dataMap.locationCode + "'");

            if (mapsto == null)
            {

                var palletList = new List<PalletDataCriteriaV2>();
                palletList.Add(new PalletDataCriteriaV2()
                {
                    options = dataMap.mappingPallets[0].options,
                    code = dataMap.baseCode,
                    qty = 1,
                    unit = null,
                    orderNo = null,
                    batch = null,
                    lot = null
                });

                foreach (var row in dataMap.mappingPallets)
                {
                    palletList.Add(new PalletDataCriteriaV2()
                    {
                        options = row.options,
                        code = row.code,
                        qty = row.qty,
                        unit = row.unit,
                        orderNo = row.orderNo,
                        batch = row.batch,
                        lot = row.lot,
                    });
                }

                var reqMapping = new WCSMappingPalletV2.TReq()
                {
                    actualWeiKG = dataMap.weight,
                    warehouseCode = dataMap.warehouseCode,
                    areaCode = dataMap.areaCode,
                    palletData = palletList
                };

                mapsto = new WCSMappingPalletV2().Execute(logger, buVO, reqMapping);
            }

            mapsto.weiKG = dataMap.weight;
            mapsto.lengthM = dataMap.length;
            mapsto.heightM = dataMap.height;
            mapsto.widthM = dataMap.width;
            mapsto.warehouseID = Warehouses.ID.Value;
            mapsto.areaID = area.ID.Value;
            mapsto.parentID = location.ID.Value;
            mapsto.parentType = StorageObjectType.LOCATION;

            return mapsto;
        }


    }
}
