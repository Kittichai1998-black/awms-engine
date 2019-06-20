﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using AMWUtil.Common;
using AMWUtil.DataAccess.Http;
using AMWUtil.Exception;
using AMWUtil.Logger;
using AWMSEngine.ADO.StaticValue;
using AWMSEngine.Engine;
using AWMSEngine.Engine.V2.Business.WorkQueue;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using ProjectAAI.ADO;

namespace ProjectAAI.Engine.Business.WorkQueue
{
    public class RegisterWorkQueue_GetSTO : IProjectEngine<RegisterWorkQueue.TReq, StorageObjectCriteria>
    {
        public class SAPResponse
        {
            public List<ZSWMRF001_OUT_SU> datas;
            public int status;
            public string message;
            public string stacktrace;
            public class ZSWMRF001_OUT_SU
            {
                /// <summary>Warehouse Code</summary>
                public string LGNUM;
                /// <summary>Storage Type</summary>
                public string LGTYP;
                /// <summary>Storage Unit Number</summary>
                public string LENUM;
                /// <summary>Material Number</summary>
                public string MATNR;
                /// <summary>Batch Number</summary>
                public string CHARG;
                /// <summary>Stock Category</summary>
                public string BESTQ;
                /// <summary>Available Stock</summary>
                public decimal VERME;
                /// <summary>Base Unit of Measure</summary>
                public string MEINS;
                /// <summary>Date of Manufacture</summary>
                public string HSDAT;
                /// <summary>Incubated Time</summary>
                public double WEBAZ;
                /// <summary>Gross Weight</summary>
                public decimal BRGEW;
                /// <summary>Weight Unit</summary>
                public string GEWEI;
                /// <summary>approved batch number </summary>
                public string FVDT1;
                /// <summary>Error message</summary>
                public string VBELN;
                /// <summary>Error message</summary>
                public string ERR_MSG;
            }
        }
        
        private class SAPReq
        {
            public string environmentName;
            public string functionName;
            public string inStructureName;
            public string inTableName;
            public string outTableName;
            public IDictionary<string, object> datas;
        }

        public StorageObjectCriteria ExecuteEngine(AMWLogger logger, VOCriteria buVO, RegisterWorkQueue.TReq reqVO)
        {
            var chkStos = AWMSEngine.ADO.StorageObjectADO.GetInstant().Get(reqVO.baseCode, null, null, false, true, buVO);
            if (chkStos == null)
            {
                return chkStos;
            }
            else
            {
                var _base = AWMSEngine.ADO.DataADO.GetInstant().SelectByCodeActive<ams_BaseMaster>(reqVO.baseCode, buVO);
                if (_base == null)
                    throw new AMWException(logger, AMWExceptionCode.V1001, "Not Found Pallet : " + reqVO.baseCode);
                var _unitType = StaticValueManager.GetInstant().UnitTypes.FirstOrDefault(x => x.ID == _base.UnitType_ID);
                var _objSize = StaticValueManager.GetInstant().ObjectSizes.FirstOrDefault(x => x.ObjectType == StorageObjectType.BASE);

                var _warehouse = StaticValueManager.GetInstant().Warehouses.FirstOrDefault(x => x.Code == reqVO.warehouseCode);
                var _area = StaticValueManager.GetInstant().AreaMasters.FirstOrDefault(x => x.Code == reqVO.areaCode);

                var packCode = reqVO.mappingPallets;

                StorageObjectCriteria baseSto = new StorageObjectCriteria()
                {
                    code = reqVO.baseCode,
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
                    warehouseID = _warehouse.ID.Value

                };

                var baseStoID = AWMSEngine.ADO.StorageObjectADO.GetInstant().PutV2(baseSto, buVO);
                packCode.ForEach(packcode =>
                {
                    var packList = GetObjectFromSAP(packcode.itemNo, packcode.souWarehouseCode, buVO);
                    packList.datas.ForEach(pack =>
                    {
                        var skuCode = pack.MATNR.TrimStart(new char[] { '0' });
                        var _sku = AWMSEngine.ADO.DataADO.GetInstant().SelectByCodeActive<ams_SKUMaster>(skuCode, buVO);
                        if (_sku == null)
                            throw new AMWException(logger, AMWExceptionCode.V2001, "SKU " + skuCode + " NotFound");
                        var _pack = AWMSEngine.ADO.DataADO.GetInstant().SelectByCodeActive<ams_PackMaster>(skuCode, buVO);
                        if (_pack == null)
                            throw new AMWException(logger, AMWExceptionCode.V2001, "SKU " + pack.MATNR + " NotFound");

                        var unit = StaticValueManager.GetInstant().UnitTypes.FirstOrDefault(x => x.Code == pack.MEINS);
                        if (unit == null)
                            throw new AMWException(logger, AMWExceptionCode.V2001, "Unit Type " + pack.MEINS + " NotFound");

                        var _objSizePack = StaticValueManager.GetInstant().ObjectSizes.FirstOrDefault(x => x.ObjectType == StorageObjectType.PACK);

                        StorageObjectCriteria packSto = new StorageObjectCriteria()
                        {
                            parentID = baseStoID,
                            parentType = StorageObjectType.BASE,
                            code = skuCode,
                            eventStatus = StorageObjectEventStatus.NEW,
                            name = _sku.Name,
                            batch = pack.CHARG,
                            qty = pack.VERME,
                            skuID = _sku.ID,
                            unitCode = unit.Code,
                            unitID = unit.ID.Value,
                            baseUnitCode = unit.Code,
                            baseUnitID = unit.ID.Value,
                            baseQty = pack.VERME,
                            objectSizeID = _objSizePack.ID.Value,
                            type = StorageObjectType.PACK,
                            productDate = (DateTime?)pack.HSDAT.Get<DateTime>(),
                            objectSizeName = _objSizePack.Name,
                            mstID = _pack.ID.Value,
                            weiKG = reqVO.weight,
                            areaID = StaticValueManager.GetInstant().AreaMasters.FirstOrDefault(x => x.Code == reqVO.areaCode).ID.Value
                        };

                        AWMSEngine.ADO.StorageObjectADO.GetInstant().PutV2(packSto, buVO);
                    });
                });

                var mapsto = AWMSEngine.ADO.StorageObjectADO.GetInstant().Get(baseStoID, StorageObjectType.BASE, false, true, buVO);
                return mapsto;
            }
        }

        private SAPResponse GetObjectFromSAP(string barcode, string warehouse, VOCriteria buVO)
        {

            var list = new Dictionary<string, object>();
            list.Add("LGNUM", "W01");
            list.Add("LENUM", barcode);
            var itemList = new SAPReq()
            {
                environmentName = "DEV",
                functionName = "ZWMRF001",
                inStructureName = "ZSWMRF001_IN_SU",
                inTableName = "IN_SU",
                outTableName = "OUT_SU",
                datas = list
            };
            var res = SAPInterfaceADO.GetInstant().postSAP<SAPResponse>(itemList, buVO.Logger, "http://localhost:51306/api/SAPConnect");
            return res;
        }
    }
}