using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.Common;
using AWMSEngine.Engine.V2.Business;
using AWMSEngine.Engine.V2.Validation;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectSTGT.Engine.Received
{
    public class ScanReceivedProductionLine : AWMSEngine.Engine.BaseEngine<ScanReceivedProductionLine.TReq, ScanReceivedProductionLine.TRes>
    {
        public class TReq
        {
            public long? rootID;
            public long? docItemID;
            public string scanCode;
            public string orderNo;
            public string batch;
            public string lot;
            public decimal amount;
            public string unitCode;
            public DateTime? productDate;
            public long? warehouseID;
            public long? areaID;
            public string locationCode;
            public string options;
            public bool isRoot = true;
            public VirtualMapSTOModeType mode;
            public VirtualMapSTOActionType action;
            public string rootOptions;
        }

        public class TRes
        {
            public StorageObjectCriteria bsto;
            public dynamic docs;
        }
        private ams_Warehouse _warehouseASRS;
        private ams_AreaMaster _areaASRS;

        protected override TRes ExecuteEngine(TReq reqVO)
        {
            var docItems = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_DocumentItem>(
            new KeyValuePair<string, object>[] {
                new KeyValuePair<string,object>("Code",reqVO.scanCode),
                new KeyValuePair<string,object>("OrderNo",reqVO.orderNo),
                new KeyValuePair<string,object>("EventStatus",DocumentEventStatus.NEW)
            }, this.BuVO);


            var docItem = docItems.Where(x => x.Options == reqVO.options).FirstOrDefault();

            var mapsto = this.MappingSto(docItem,reqVO);
            return null;
        }
        private amt_StorageObject MappingSto(amt_DocumentItem docItem, TReq reqVO)
        {
            //var mapsto = new StorageObjectCriteria();

            //{   // Map data to Table StorageObject
            //    var Warehouses = StaticValue.Warehouses.FirstOrDefault(x => x.ID == reqVO.warehouseID).Code;
            //    if (Warehouses == null)
            //        throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Not Found Warehouse Code '" + Warehouses + "'");

            //    var area = StaticValue.AreaMasters.FirstOrDefault(x => x.ID == reqVO.areaID && x.Warehouse_ID == reqVO.warehouseID);
            //    if (area == null)
            //        throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Not Found Area ID '" + reqVO.areaID + "'");

            //    mapsto = AWMSEngine.ADO.StorageObjectADO.GetInstant().Get(reqVO.baseCode,
            //        null, null, false, true, this.BuVO);

            //    var location = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<ams_AreaLocationMaster>(
            //        new KeyValuePair<string, object>[] {
            //            new KeyValuePair<string,object>("Code",reqVO.locationCode),
            //            new KeyValuePair<string,object>("AreaMaster_ID",area.ID.Value),
            //            new KeyValuePair<string,object>("Status", EntityStatus.ACTIVE)
            //        }, buVO).FirstOrDefault();

            //    if (location == null)
            //        throw new AMWException(logger, AMWExceptionCode.V1001, "Not Found Location Code '" + reqVO.locationCode + "'");

            //    if (mapsto == null)
            //    {

            //        var palletList = new List<PalletDataCriteriaV2>();
            //        palletList.Add(new PalletDataCriteriaV2()
            //        {
            //            options = reqVO.mappingPallets[0].options,
            //            code = reqVO.baseCode,
            //            qty = "1",
            //            unit = null,
            //            orderNo = null,
            //            batch = null,
            //            lot = null,
            //            prodDate = reqVO.mappingPallets[0].prodDate,
            //            forCustomerCode = reqVO.mappingPallets[0].forCustomerCode


            //        });

            //        foreach (var row in reqVO.mappingPallets)
            //        {
            //            palletList.Add(new PalletDataCriteriaV2()
            //            {
            //                options = row.options,
            //                code = row.code,
            //                qty = row.qty,
            //                unit = row.unit,
            //                orderNo = row.orderNo,
            //                batch = row.batch,
            //                lot = row.lot,
            //                prodDate = row.prodDate,
            //                movingType = row.movingType
            //            });
            //        }

            //        var reqMapping = new WCSMappingPalletV2.TReq()
            //        {
            //            actualWeiKG = reqVO.weight,
            //            warehouseCode = reqVO.warehouseCode,
            //            areaCode = reqVO.areaCode,
            //            palletData = palletList
            //        };

            //        mapsto = new WCSMappingPalletV2().Execute(logger, buVO, reqMapping);
            //    }

            //    mapsto.weiKG = reqVO.weight;
            //    mapsto.lengthM = reqVO.length;
            //    mapsto.heightM = reqVO.height;
            //    mapsto.widthM = reqVO.width;
            //    mapsto.warehouseID = Warehouses.ID.Value;
            //    mapsto.areaID = area.ID.Value;
            //    mapsto.parentID = location.ID.Value;
            //    mapsto.parentType = StorageObjectType.LOCATION;


            //}

            //return mapsto;
            return null;
        }
    }
}
