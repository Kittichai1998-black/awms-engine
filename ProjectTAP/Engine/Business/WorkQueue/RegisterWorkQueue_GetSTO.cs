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

namespace ProjectTAP.Engine.Business.WorkQueue
{
    public class RegisterWorkQueue_GetSTO : IProjectEngine<
        RegisterWorkQueue.TReq,
        StorageObjectCriteria
        >
    {
        public StorageObjectCriteria ExecuteEngine(AMWLogger logger, VOCriteria buVO, RegisterWorkQueue.TReq reqVO)
        {
            var StaticValue = AWMSEngine.ADO.StaticValue.StaticValueManager.GetInstant();
            if (reqVO.baseCode == null || reqVO.baseCode == "" || reqVO.baseCode == String.Empty)
                throw new AMWException(logger, AMWExceptionCode.V1001, "Base Code is null");

            if (reqVO.mappingPallets[0].itemNo == null || reqVO.mappingPallets[0].itemNo == "" || reqVO.mappingPallets[0].itemNo == String.Empty)
                throw new AMWException(logger, AMWExceptionCode.V1001, "ItemNo is null");

            if (reqVO.mappingPallets[0].prodDate == null || reqVO.mappingPallets[0].prodDate == "" || reqVO.mappingPallets[0].prodDate == String.Empty)
                throw new AMWException(logger, AMWExceptionCode.V1001, "Product Date is null");

            if (reqVO.mappingPallets[0].code == null || reqVO.mappingPallets[0].code == "" || reqVO.mappingPallets[0].code == String.Empty)
                throw new AMWException(logger, AMWExceptionCode.V1001, "SKU Code Date is null");

            var baseMasterData = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<ams_BaseMaster>(
                new KeyValuePair<string, object>[] {
                    new KeyValuePair<string,object>("Code",reqVO.baseCode),
                    new KeyValuePair<string,object>("Status",1),
                }, buVO);

            if (baseMasterData.Count <= 0)
                throw new AMWException(logger, AMWExceptionCode.V1001, "Not Found Base Code '" + reqVO.baseCode + "'");


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

                if (mapsto == null || mapsto.eventStatus == StorageObjectEventStatus.NEW)
                {
                    if (mapsto != null && mapsto.eventStatus == StorageObjectEventStatus.NEW)
                        AWMSEngine.ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(mapsto.id.Value, null, null, StorageObjectEventStatus.REMOVED, buVO);

                    var palletList = new List<PalletDataCriteriaV2>();
                    palletList.Add(new PalletDataCriteriaV2()
                    {
                        option = reqVO.mappingPallets[0].option,
                        code = reqVO.baseCode,
                        qty = "1",
                        unit = null,
                        orderNo = null,
                        batch = null,
                        lot = null,
                        prodDate = reqVO.mappingPallets[0].prodDate


                    });

                    foreach (var row in reqVO.mappingPallets)
                    {
                        palletList.Add(new PalletDataCriteriaV2()
                        {
                            option = row.option,
                            code = row.code,
                            qty = row.qty,
                            unit = row.unit,
                            orderNo = row.orderNo,
                            batch = row.batch,
                            lot = row.lot,
                            prodDate = row.prodDate

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
