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
            amt_Document docGR = new amt_Document();
            List<amt_DocumentItem> docGRItems = new List<amt_DocumentItem>();

            //Inbound Zone
            docGR = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_Document>(
                new SQLConditionCriteria[] {
                        new SQLConditionCriteria("DocumentProcessType_ID",4010, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("EventStatus","11",SQLOperatorType.EQUALS)
            }, buVO).FirstOrDefault();

            if(docGR == null)
                throw new AMWException(logger, AMWExceptionCode.V1001, "Document is not Found");

            docGRItems = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_DocumentItem>(
                new SQLConditionCriteria[] {
                        new SQLConditionCriteria("Document_ID",docGR.ID, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("EventStatus","11",SQLOperatorType.IN),
            }, buVO);

            if (reqVO.mappingPallets != null && reqVO.mappingPallets.Count > 0)
            {
               

                foreach (var mappingPallet in reqVO.mappingPallets)
                {//Check Qty
                    if (reqVO.areaCode == "In")
                    {
                        //Inbound Zone
                        if (mappingPallet.qty <= 3)
                        {
                            stos = this.mapPallet(logger, reqVO, null, buVO);
                            this.mapDisto(logger, stos, docGRItems, buVO);
                        }
                        else
                        {
                            throw new AMWException(logger, AMWExceptionCode.V1001, "Qty is greater than 3");
                        }


                    }
                    else if (reqVO.areaCode == "Out")
                    {
                        //Outbound Zone
                        if (mappingPallet.qty <= 16)
                        {
                            stos = this.mapPallet(logger, reqVO, null, buVO);
                            this.mapDisto(logger, stos, docGRItems, buVO);
                        }
                        else
                        {
                            throw new AMWException(logger, AMWExceptionCode.V1001, "Qty is greater than 16");
                        }
                    }

                }
                //=========================================================
            }
            else
            {
                //No mappingPallets

                    stos = this.mapPallet(logger, reqVO, docGRItems, buVO);
                    this.mapDisto(logger, stos, docGRItems, buVO);

            }

            return stos;

        }
        private StorageObjectCriteria mapPallet(AMWLogger logger, RegisterWorkQueue.TReq dataMap, List<amt_DocumentItem> dataDoc, VOCriteria buVO)
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
                    code = dataMap.baseCode,
                    qty = 1,
                    unit = null,
                    orderNo = null,
                    batch = null,
                    lot = null
                });

                if (dataDoc != null)
                {
                    foreach (var row in dataDoc)
                    {
                        palletList.Add(new PalletDataCriteriaV2()
                        {
                            code = row.Code,
                            qty = dataMap.areaCode == "In" ? 3 : (dataMap.areaCode == "Out"  ? 16 : row.Quantity),
                            unit = StaticValue.UnitTypes.FirstOrDefault(x => x.ID == row.UnitType_ID).Code,
                            orderNo = row.OrderNo,
                            batch = row.Batch,
                            lot = row.Lot,
                        }); ;
                    }
                }
                else
                {

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
                }
                var reqMapping = new MappingPallet.TReq()
                {
                    actualWeiKG = dataMap.weight,
                    warehouseCode = dataMap.warehouseCode,
                    areaCode = dataMap.areaCode,
                    palletData = palletList
                };

                //ams_PackMaster pm = AWMSEngine.ADO.MasterADO.GetInstant().GetPackMasterByPack(dataMap., buVO);
               

                mapsto = new MappingPallet().Execute(logger, buVO, reqMapping);
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
        private List<amt_DocumentItemStorageObject> mapDisto(AMWLogger logger, StorageObjectCriteria data, List<amt_DocumentItem> dataDoc, VOCriteria buVO)
        {
            // Map data to Table DocumentStorageObject
            var stoMap = data.ToTreeList().Find(x => x.type == StorageObjectType.PACK);

            var disto = new List <amt_DocumentItemStorageObject>();
            foreach (var docItem in dataDoc)
            {
                disto.Add(new amt_DocumentItemStorageObject()
                {
                    ID = null,
                    DocumentItem_ID = docItem.ID,
                    Sou_StorageObject_ID = stoMap.id.Value,
                    Des_StorageObject_ID = stoMap.id.Value,
                    Quantity = stoMap.qty,
                    BaseQuantity = stoMap.baseQty,
                    UnitType_ID = stoMap.unitID,
                    BaseUnitType_ID = stoMap.baseUnitID,
                    Status = EntityStatus.ACTIVE
                });
            };


            AWMSEngine.ADO.DocumentADO.GetInstant().InsertMappingSTO(disto, buVO);


           var dataDisto = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(
                new SQLConditionCriteria[] {
                    new SQLConditionCriteria("Sou_StorageObject_ID",stoMap.id, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("Status",0,SQLOperatorType.EQUALS)
                }, buVO);

            return dataDisto;
        }

    }
}
