using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Exception;
using AWMSEngine.Common;
using AWMSEngine.Engine.Business.Received;
using AWMSEngine.Engine.V2.Business;
using AWMSEngine.Engine.V2.Business.WorkQueue;
using AWMSEngine.Engine.V2.Validation;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;

namespace ProjectTAP.Engine.Business.Received
{
    public class WCSMapBaseRegister : AWMSEngine.Engine.V2.Business.WorkQueue.BaseRegisterWorkQueue
    {

        protected override StorageObjectCriteria GetSto(TReq reqVO)
        {
            //Check DocItems
            if (reqVO.baseCode == null || reqVO.baseCode == "" || reqVO.baseCode == String.Empty )
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Base Code is null");

            if (reqVO.mappingPallets[0].itemNo == null || reqVO.mappingPallets[0].itemNo == "" || reqVO.mappingPallets[0].itemNo == String.Empty)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ItemNo is null");

            if (reqVO.mappingPallets[0].prodDate == null || reqVO.mappingPallets[0].prodDate == "" || reqVO.mappingPallets[0].prodDate == String.Empty)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Product Date is null");

            if (reqVO.mappingPallets[0].code == null || reqVO.mappingPallets[0].code == "" || reqVO.mappingPallets[0].code == String.Empty)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "SKU Code Date is null");

            var baseMasterData = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<ams_BaseMaster>(
                new KeyValuePair<string, object>[] {
                    new KeyValuePair<string,object>("Code",reqVO.baseCode),
                    new KeyValuePair<string,object>("Status",1),
                }, this.BuVO);

            if (baseMasterData.Count <= 0)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Not Found Base Code '" + reqVO.baseCode + "'");

            List<amt_DocumentItem> diList = new List<amt_DocumentItem>();
            foreach (var row in reqVO.mappingPallets)
            {
                var date = Convert.ToDateTime(row.prodDate);
                diList = ADO.DocumentADO.GetInstant().ListDocsItemCheckRegister(row.code, date, int.Parse(row.qty), row.itemNo, this.BuVO);

            }
            var mapsto = new StorageObjectCriteria();
            if (diList.Count > 0)
            {   // Map data to Table StorageObject
                var Warehouses = this.StaticValue.Warehouses.FirstOrDefault(x => x.Code == reqVO.warehouseCode);
                if (Warehouses == null)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Not Found Warehouse Code '" + reqVO.warehouseCode + "'");

                var area = this.StaticValue.AreaMasters.FirstOrDefault(x => x.Code == reqVO.areaCode && x.Warehouse_ID == Warehouses.ID);
                if (area == null)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Not Found Area Code '" + reqVO.areaCode + "'");

                mapsto = AWMSEngine.ADO.StorageObjectADO.GetInstant().Get(reqVO.baseCode,
                    null, null, false, true, this.BuVO);

                var location = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<ams_AreaLocationMaster>(
                    new KeyValuePair<string, object>[] {
                        new KeyValuePair<string,object>("Code",reqVO.locationCode),
                        new KeyValuePair<string,object>("AreaMaster_ID",area.ID.Value),
                        new KeyValuePair<string,object>("Status", EntityStatus.ACTIVE)
                    }, this.BuVO).FirstOrDefault();

                if (location == null)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Not Found Location Code '" + reqVO.locationCode + "'");

                if (mapsto == null || mapsto.eventStatus == StorageObjectEventStatus.NEW)
                {
                    if (mapsto != null && mapsto.eventStatus == StorageObjectEventStatus.NEW)
                        AWMSEngine.ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(mapsto.id.Value, null, null, StorageObjectEventStatus.REMOVED, this.BuVO);

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
            
            }
            else
            {
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "No SKU waiting to be received");
            }

            return mapsto;
        }


        protected override List<amt_DocumentItem> GetDocumentItemAndDISTO(StorageObjectCriteria sto, TReq reqVO)
        {
            List<amt_DocumentItem> docItem = new List<amt_DocumentItem>();
            var date = Convert.ToDateTime(reqVO.mappingPallets[0].prodDate);
            var diList = ADO.DocumentADO.GetInstant().ListDocsItemCheckRegister(reqVO.mappingPallets[0].code, date, int.Parse(reqVO.mappingPallets[0].qty), reqVO.mappingPallets[0].itemNo, this.BuVO);


            List<amt_DocumentItemStorageObject> diSto = new List<amt_DocumentItemStorageObject>();

            foreach (var diListData in diList)
            {
                diSto = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(
                   new SQLConditionCriteria[] {
                        new SQLConditionCriteria("DocumentItem_ID",diListData.ID, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("Status", 1, SQLOperatorType.EQUALS, SQLConditionType.AND)
                }, new SQLOrderByCriteria[] { }, null, null, this.BuVO);
                diListData.DocItemStos = diSto;
            }

            if (diSto.Count > 0)
            {
                //มีใน disto
                foreach (var diListData in diList)
                {

                    var sumQtyInDocItem = diSto.Where(x => x.Status == EntityStatus.ACTIVE).Sum(x => x.Quantity).Value;
                    var sumQtyCheck = diListData.Quantity - sumQtyInDocItem;

                    if (Int32.Parse(reqVO.mappingPallets[0].qty) <= sumQtyCheck)
                    {
                        //map
                        var UnitType = this.StaticValue.UnitTypes.FirstOrDefault(x => x.Code == reqVO.mappingPallets[0].unit);
                        amt_DocumentItemStorageObject dataMapDisto = new amt_DocumentItemStorageObject()
                        {
                            DocumentItem_ID = diListData.ID.Value,
                            Sou_StorageObject_ID = sto.id.Value,
                            Des_StorageObject_ID = null,
                            Quantity = System.Convert.ToDecimal(reqVO.mappingPallets[0].qty),
                            BaseQuantity = System.Convert.ToDecimal(reqVO.mappingPallets[0].qty),
                            UnitType_ID = UnitType.ID.Value,
                            BaseUnitType_ID = UnitType.ID.Value,

                        };

                        var mapDiSto = AWMSEngine.ADO.DocumentADO.GetInstant().InsertMappingSTO(dataMapDisto, this.BuVO);
                        diListData.DocItemStos.Add(mapDiSto);
                    }
                    else
                    {
                        //error สินค้าไม่พอ
                        throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Qty is not receive");

                    }
                }
            }
            else
            {   //ไม่มีใน disto map ได้เลย
                foreach (var diListData in diList)
                {
                    var UnitType = this.StaticValue.UnitTypes.FirstOrDefault(x => x.Code == reqVO.mappingPallets[0].unit);
                    amt_DocumentItemStorageObject dataMapDisto = new amt_DocumentItemStorageObject()
                    {
                        DocumentItem_ID = diListData.ID.Value,
                        Sou_StorageObject_ID = sto.id.Value,
                        Des_StorageObject_ID = sto.id.Value,
                        Quantity = System.Convert.ToDecimal(reqVO.mappingPallets[0].qty),
                        BaseQuantity = System.Convert.ToDecimal(reqVO.mappingPallets[0].qty),
                        UnitType_ID = UnitType.ID.Value,
                        BaseUnitType_ID = UnitType.ID.Value,
                        Status = EntityStatus.ACTIVE
                    };

                    var mapDiSto = AWMSEngine.ADO.DocumentADO.GetInstant().InsertMappingSTO(dataMapDisto, this.BuVO);
                    diListData.DocItemStos.Add(mapDiSto);

                }
            }
            return diList;
        }

    }
}
