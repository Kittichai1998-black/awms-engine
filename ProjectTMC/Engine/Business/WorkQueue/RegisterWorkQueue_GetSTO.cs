﻿using AMWUtil.Common;
using AMWUtil.Exception;
using AMWUtil.Logger;
using AWMSEngine.Engine;
using AWMSEngine.Engine.Business.Received;
using AWMSEngine.Engine.V2.Business.WorkQueue;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectTMC.Engine.Business.WorkQueue
{
    public class RegisterWorkQueue_GetSTO : IProjectEngine<
        RegisterWorkQueue.TReq,
        StorageObjectCriteria
        >
    {
        public StorageObjectCriteria ExecuteEngine(AMWLogger logger, VOCriteria buVO, RegisterWorkQueue.TReq reqVO)
        {
            StorageObjectCriteria stos = new StorageObjectCriteria();
            var StaticValue = AWMSEngine.ADO.StaticValue.StaticValueManager.GetInstant();
            if (reqVO.baseCode == null || reqVO.baseCode == "" || reqVO.baseCode == String.Empty)
                throw new AMWException(logger, AMWExceptionCode.V1001, "Base Code is null");

            var baseMasterData = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<ams_BaseMaster>(
                new KeyValuePair<string, object>[] {
                    new KeyValuePair<string,object>("Code",reqVO.baseCode),
                    new KeyValuePair<string,object>("Status",1),
                }, buVO);

            var docGR = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_DocumentItem>(
            new KeyValuePair<string, object>[] {
                new KeyValuePair<string,object>("EventStatus",DocumentEventStatus.WORKING)
            }, buVO).FirstOrDefault();
            if (docGR == null)
            {
                throw new AMWException(logger, AMWExceptionCode.V1001, "Good Received Document Not Found");
            }
            var distoDoc = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(
            new KeyValuePair<string, object>[] {
                new KeyValuePair<string,object>("DocumentItem_ID",docGR.ID),
                
            }, buVO);

            //var sum = distoDoc.Sum(x => x.Quantity);
            //var sumQty = sum + reqVO.mappingPallets[0].qty;
            //if (sumQty > docGR.Quantity)
            //{
            //    throw new AMWException(logger, AMWExceptionCode.V1001, "Qty more then Good Received Document");
            //}
            
     
            if (baseMasterData.Count <= 0)
            {
                //ไม่มีในระบบ insert เข้า baseMaster
                AWMSEngine.ADO.DataADO.GetInstant().Insert<ams_BaseMaster>(buVO, new ams_BaseMaster()
                {
                    Code = reqVO.baseCode,
                    Name = "Pallet",
                    BaseMasterType_ID = 1,
                    Description = "",
                    ObjectSize_ID = 3,
                    Status = EntityStatus.ACTIVE,
                    UnitType_ID = 2,
                    //WeightKG = Convert.ToDecimal(0.5)
                    WeightKG = 30
                });
            }

            stos = AWMSEngine.ADO.StorageObjectADO.GetInstant().Get(reqVO.baseCode, null, null, false, true, buVO);


            if (stos != null)
            {

                var stoPack = stos.ToTreeList().Find(x => x.type == StorageObjectType.PACK && (x.eventStatus == StorageObjectEventStatus.AUDITING || x.eventStatus == StorageObjectEventStatus.AUDITED));
                if (stoPack == null)
                    throw new AMWException(logger, AMWExceptionCode.V1001, "Pallet have in system");

                stoPack.qty = Convert.ToDecimal(reqVO.mappingPallets.First().qty);
                AWMSEngine.ADO.StorageObjectADO.GetInstant().PutV2(stoPack, buVO);

                var Warehouses = StaticValue.Warehouses.FirstOrDefault(x => x.Code == reqVO.warehouseCode);
                if (Warehouses == null)
                    throw new AMWException(logger, AMWExceptionCode.V1001, "Not Found Warehouse Code '" + reqVO.warehouseCode + "'");
                var area = StaticValue.AreaMasters.FirstOrDefault(x => x.Code == reqVO.areaCode && x.Warehouse_ID == Warehouses.ID);
                if (area == null)
                    throw new AMWException(logger, AMWExceptionCode.V1001, "Not Found Area Code '" + reqVO.areaCode + "'");

                stos.ToTreeList().ForEach(x =>
                {
                    x.areaID = area.ID.Value;
                    x.warehouseID = Warehouses.ID.Value;
                });

                return stos;
            }
            else
            {

                var mapsto = new StorageObjectCriteria();

                {   // Map data to Table StorageObject
                    var Warehouses = StaticValue.Warehouses.FirstOrDefault(x => x.Code == reqVO.warehouseCode);
                    if (Warehouses == null)
                        throw new AMWException(logger, AMWExceptionCode.V1001, "Not Found Warehouse Code '" + reqVO.warehouseCode + "'");

                    var area = StaticValue.AreaMasters.FirstOrDefault(x => x.Code == reqVO.areaCode && x.Warehouse_ID == Warehouses.ID);
                    if (area == null)
                        throw new AMWException(logger, AMWExceptionCode.V1001, "Not Found Area Code '" + reqVO.areaCode + "'");

                    mapsto = AWMSEngine.ADO.StorageObjectADO.GetInstant().Get(reqVO.baseCode,
                        null, null, false, true, buVO);

                    var location = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<ams_AreaLocationMaster>(
                        new KeyValuePair<string, object>[] {
                        new KeyValuePair<string,object>("Code",reqVO.locationCode),
                        new KeyValuePair<string,object>("AreaMaster_ID",area.ID.Value),
                        new KeyValuePair<string,object>("Status", EntityStatus.ACTIVE)
                        }, buVO).FirstOrDefault();

                    if (location == null)
                        throw new AMWException(logger, AMWExceptionCode.V1001, "Not Found Location Code '" + reqVO.locationCode + "'");

                
                    if (mapsto == null)
                    {

                        var palletList = new List<PalletDataCriteriaV2>();
                        palletList.Add(new PalletDataCriteriaV2()
                        {
                           
                            code = reqVO.baseCode,
                            qty = 1,
                            unit = null,
                            orderNo = null,
                            batch = null,
                            lot = null,
                         


                        });

                        foreach (var row in reqVO.mappingPallets)
                        {
                            palletList.Add(new PalletDataCriteriaV2()
                            {
                               
                                code = docGR.Code,
                                qty = docGR.Quantity,
                                unit = StaticValue.UnitTypes.FirstOrDefault(x => x.ID == docGR.UnitType_ID).Code, 
                                orderNo = null,
                                batch = null,
                                lot = docGR.Lot,
                                //prodDate = row.prodDate,
                                //movingType = row.movingType
                            });
                        }

                        var reqMapping = new WCSMappingPalletV2.TReq()
                        {
                            actualWeiKG = reqVO.weight,
                            warehouseCode = reqVO.warehouseCode,
                            areaCode = reqVO.areaCode,
                            palletData = palletList
                        };

                        mapsto = new WCSMappingPalletV2().Execute(logger, buVO, reqMapping);
                    }

                    mapsto.weiKG = reqVO.weight;
                    mapsto.lengthM = reqVO.length;
                    mapsto.heightM = reqVO.height;
                    mapsto.widthM = reqVO.width;
                    mapsto.warehouseID = Warehouses.ID.Value;
                    mapsto.areaID = area.ID.Value;
                    mapsto.parentID = location.ID.Value;
                    mapsto.parentType = StorageObjectType.LOCATION;


                }

                return mapsto;
            }
        }
    }
}
