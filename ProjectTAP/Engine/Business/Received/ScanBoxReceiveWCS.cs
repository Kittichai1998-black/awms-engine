using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Exception;
using AWMSEngine.Engine.Business.Received;
using AWMSEngine.Engine.V2.Business;
using AWMSEngine.Engine.V2.Business.WorkQueue;
using AWMSEngine.Engine.V2.Validation;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;

namespace ProjectTAP.Engine.Business.Received
{
    public class ScanBoxReceiveWCS : AWMSEngine.Engine.V2.Business.WorkQueue.BaseRegisterWorkQueue
    {

        protected override StorageObjectCriteria GetSto(TReq reqVO)
        {
            var Warehouses = this.StaticValue.Warehouses.FirstOrDefault(x => x.Code == reqVO.warehouseCode);
            var area = this.StaticValue.AreaMasters.FirstOrDefault(x => x.Code == reqVO.areaCode && x.Warehouse_ID == Warehouses.ID);
            var mapsto = AWMSEngine.ADO.StorageObjectADO.GetInstant().Get(reqVO.baseCode,
            null, null, false, true, this.BuVO);

            var location = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<ams_AreaLocationMaster>(
                new KeyValuePair<string, object>[] {
                    new KeyValuePair<string,object>("Code",reqVO.locationCode),
                    new KeyValuePair<string,object>("AreaMaster_ID",area.ID.Value),
                    new KeyValuePair<string,object>("Status", EntityStatus.ACTIVE)
                }, this.BuVO).FirstOrDefault();

            if (mapsto == null || mapsto.eventStatus == StorageObjectEventStatus.NEW)
            {
                if (mapsto != null && mapsto.eventStatus == StorageObjectEventStatus.NEW)
                    AWMSEngine.ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(mapsto.id.Value, null, null, StorageObjectEventStatus.REMOVED, this.BuVO);

                var palletList = new List<PalletDataCriteriaV2>();
                palletList.Add(new PalletDataCriteriaV2()
                {
                    souWarehouseCode = "Sou_Warehouse_Code=" + reqVO.mappingPallets[0].souWarehouseCode,
                    code = reqVO.baseCode,
                    qty = "1",
                    unit = null,
                    orderNo = null,
                    batch = null,
                    lot = null

                });

                foreach (var row in reqVO.mappingPallets)
                {
                    palletList.Add(new PalletDataCriteriaV2()
                    {
                        souWarehouseCode = "Sou_Warehouse_Code=" + row.souWarehouseCode,
                        code = row.code,
                        qty = row.qty,
                        unit = row.unit,
                        orderNo = row.orderNo,
                        batch = row.batch,
                        lot = row.lot,

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

                mapsto = new WCSMappingPalletV2().Execute(this.Logger, this.BuVO, reqMapping);
            }
            mapsto.weiKG = reqVO.weight;
            mapsto.lengthM = reqVO.length;
            mapsto.heightM = reqVO.height;
            mapsto.widthM = reqVO.width;
            mapsto.warehouseID = Warehouses.ID.Value;
            mapsto.areaID = area.ID.Value;
            mapsto.parentID = location.ID.Value;
            mapsto.parentType = StorageObjectType.LOCATION;

            //this.SetWeiChildAndUpdateInfoToChild(mapsto, reqVO.weight ?? 0);

            AWMSEngine.ADO.StorageObjectADO.GetInstant()
                .UpdateStatusToChild(mapsto.id.Value, StorageObjectEventStatus.NEW, null, StorageObjectEventStatus.RECEIVING, this.BuVO);

            return mapsto;

        }
    


        protected override List<amt_DocumentItem> GetDocumentItemAndDISTO(StorageObjectCriteria sto, TReq reqVO)
        {

            return null;
        }

    }
}
