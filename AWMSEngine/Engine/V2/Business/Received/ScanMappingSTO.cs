using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.ADO;
using AWMSEngine.ADO.StaticValue;
using AWMSEngine.Engine.V2.General;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.Received
{
    public class ScanMappingSTO : BaseEngine<ScanMappingSTO.TReq, ScanMappingSTO.TRes>
    {
        private StorageObjectADO ADOSto = ADO.StorageObjectADO.GetInstant();

        public class TReq
        {
            public DocumentProcessTypeID processType;
            public string bstoCode;
            public long? bstoID;

            public long warehouseID;
            public long areaID;
            public long? locationID;

            public List<PackSto> pstos;
            public class PackSto
            {
                public string pstoCode;
                public long? pstoID;

                public string batch;
                public string lot;
                public string orderNo;
                public string itemNo;
                public string refID;
                public string ref1;
                public string ref2;//SKU1,SKU1|B001,B002|100,500|PC,CAR
                public string ref3;
                public string ref4;
                public string cartonNo;
                public string options;
                public decimal addQty;
                public string unitTypeCode; // old unit 
                public string packUnitTypeCode; 
                public DateTime? expireDate;
                public DateTime? incubationDate;
                public DateTime? productDate;
            }

        }
        public class TRes
        {
            public StorageObjectCriteria sto;
            public long? GR_ID;
            public string GR_Code;
            public long? PA_ID;
            public string PA_Code;
        }
        protected override TRes ExecuteEngine(TReq reqVO)
        {
            var res = new TRes();
            StorageObjectCriteria mapsto = null;
             
            if (reqVO.bstoID == null)
            {
                //ไม่ระบุ bstoID ต้องเอา bstoCode ไปเช็คว่ามีมั้ย ถ้ามี getSto ไม่มีสร้าง sto base ใหม่ 
                if (!String.IsNullOrEmpty(reqVO.bstoCode))
                {
                    mapsto = this.ADOSto.Get(reqVO.bstoCode, null, null, false, true, this.BuVO);

                    var check = mapsto.GetCheckSum();
                    StaticValueManager.GetInstant().LoadUnitType(BuVO);

                    if (reqVO.pstos != null && reqVO.pstos.Count() > 0)
                    {
                        if (mapsto == null)
                        {
                            //สร้างใหม่
                            var idBase = GetBaseSTO(reqVO);

                            //map packsto
                            reqVO.pstos.ForEach(psto =>
                            {
                                createSTO(psto, idBase);
                            });
                        }
                        else
                        {
                            var idBase = mapsto.id.Value;
                            reqVO.pstos.ForEach(psto =>
                            {
                                createSTO(psto, idBase);
                            });
                        }
                        //call engine สร้างdocument

                    }
                    else
                    {
                        if (mapsto == null)
                        {
                            //ไม่สร้างใหม่ เเต่ปั้น STO base return
                            var checkBaseMaster = AWMSEngine.ADO.DataADO.GetInstant().SelectByCodeActive<ams_BaseMaster>(reqVO.bstoCode, BuVO);
                            if (checkBaseMaster == null)
                            {
                                throw new AMWException(Logger, AMWExceptionCode.V1001, "ไม่มีข้อมูลพาเลท " + reqVO.bstoCode + " ในระบบ");
                            }

                            var _unitType = StaticValueManager.GetInstant().UnitTypes.FirstOrDefault(x => x.ID == checkBaseMaster.UnitType_ID);

                            mapsto.code = reqVO.bstoCode;
                            mapsto.eventStatus = StorageObjectEventStatus.ACTIVE;
                            mapsto.name = "Pallet";
                            mapsto.parentID = reqVO.areaID;
                            mapsto.parentType = StorageObjectType.LOCATION;
                            mapsto.qty = 1;
                            mapsto.baseQty = 1;
                            mapsto.unitID = _unitType.ID.Value;
                            mapsto.baseUnitID = _unitType.ID.Value;
                            mapsto.unitCode = _unitType.Code;
                            mapsto.baseUnitCode = _unitType.Code;
                            mapsto.type = StorageObjectType.BASE;
                            mapsto.areaID = reqVO.areaID;
                            mapsto.warehouseID = reqVO.warehouseID;
                            mapsto.mstID = checkBaseMaster.ID.Value;

                            res.sto = mapsto;
                        }
                        else
                        {
                            if (mapsto.warehouseID != reqVO.warehouseID)
                                throw new AMWException(this.Logger, AMWExceptionCode.V1002, "Warehouse ไม่ถูกต้อง");
                            if (mapsto.areaID != reqVO.areaID)
                                throw new AMWException(this.Logger, AMWExceptionCode.V1002, "Area ไม่ถูกต้อง");
                            //มีของเดิม
                            var idBase = mapsto.id.Value;
                            reqVO.pstos.ForEach(psto =>
                            {
                                createSTO(psto, idBase);
                            });
                        }
                    }


                }
                else
                {
                    throw new AMWUtil.Exception.AMWException(this.Logger, AMWExceptionCode.V1002, "ไม่ระบุเลขพาเลท");
                }

            }
            else
            {
                mapsto = this.ADOSto.Get(reqVO.bstoID.Value, StorageObjectType.BASE, false, true, this.BuVO);
                if (mapsto == null)
                    throw new AMWUtil.Exception.AMWException(this.Logger, AMWExceptionCode.V1002, "ไม่พบข้อมูลพาเลท");

                //var stoBase = mapsto.ToTreeList().Where(x => x.type == StorageObjectType.BASE).ToList();
                //map packsto
                if (reqVO.pstos != null && reqVO.pstos.Count() > 0)
                {
                    if (mapsto.warehouseID != reqVO.warehouseID)
                        throw new AMWException(this.Logger, AMWExceptionCode.V1002, "Warehouse ไม่ถูกต้อง");
                    if (mapsto.areaID != reqVO.areaID)
                        throw new AMWException(this.Logger, AMWExceptionCode.V1002, "Area ไม่ถูกต้อง");
                    //มีของเดิม
                    var idBase = mapsto.id.Value;
                    reqVO.pstos.ForEach(psto =>
                    {
                        createSTO(psto, idBase);
                    });
                }
                 

                res.sto = this.ADOSto.Get(reqVO.bstoID.Value, StorageObjectType.BASE, false, true, this.BuVO); ;
            }
            void createSTO(TReq.PackSto psto, long idBase)
            {
                //var oldPsto = this.ADOSto.Get(reqVO.bstoCode, null, null, true, true, this.BuVO);

                var sku = ADO.DataADO.GetInstant().SelectByCodeActive<ams_SKUMaster>(psto.pstoCode, BuVO);
                    var pack = new ams_PackMaster();
                    ConvertUnitCriteria unitTypeConvt = new ConvertUnitCriteria();
                    if (sku == null)
                    {
                        throw new AMWException(Logger, AMWExceptionCode.V1001, "ไม่พบข้อมูลสินค้า " + psto.pstoCode + " ในระบบ");
                    }
                    else
                    {
                        var unitType = ADO.DataADO.GetInstant().SelectByCodeActive<ams_UnitType>(psto.unitTypeCode, BuVO);
                        var packUnitType = new ams_UnitType();
                        if (String.IsNullOrEmpty(psto.packUnitTypeCode))
                        {
                            packUnitType = ADO.DataADO.GetInstant().SelectByID<ams_UnitType>(sku.UnitType_ID.Value, BuVO);
                            unitTypeConvt = StaticValue.ConvertToNewUnitBySKU(sku.ID.Value, psto.addQty, unitType.ID.Value, sku.UnitType_ID.Value);
                        }
                        else
                        {
                            packUnitType = ADO.DataADO.GetInstant().SelectByCodeActive<ams_UnitType>(psto.packUnitTypeCode, BuVO);
                            unitTypeConvt = StaticValue.ConvertToNewUnitBySKU(sku.ID.Value, psto.addQty, unitType.ID.Value, packUnitType.ID.Value);
                        }

                        pack = ADO.DataADO.GetInstant().SelectByID<ams_PackMaster>(unitTypeConvt.packMaster_ID, BuVO);

                    }
                    decimal newQty = unitTypeConvt.newQty;
                    decimal baseQty = unitTypeConvt.baseQty;

                    StorageObjectCriteria packSto = new StorageObjectCriteria()
                    {
                        type = StorageObjectType.PACK,
                        mstID = pack.ID.Value,
                        areaID = reqVO.areaID,
                        eventStatus = StorageObjectEventStatus.NEW,
                        parentID = idBase,
                        parentType = StorageObjectType.BASE,
                        options = psto.options,
                        orderNo = psto.orderNo,
                        batch = psto.batch,
                        lot = psto.lot,
                        cartonNo = psto.cartonNo,
                        qty = newQty,
                        unitID = unitTypeConvt.newUnitType_ID,
                        baseQty = baseQty,
                        baseUnitID = unitTypeConvt.baseUnitType_ID,
                        productDate = psto.productDate,
                        expiryDate = psto.expireDate,
                        incubationDate = psto.incubationDate,
                        refID = psto.refID,
                        ref1 = psto.ref1,
                        ref2 = psto.ref2,
                        ref3 = psto.ref3,
                        ref4 = psto.ref4,
                    };
                    var resStopack = AWMSEngine.ADO.StorageObjectADO.GetInstant().PutV2(packSto, BuVO);
                
            }

            return res;
        }

        private long GetBaseSTO(TReq reqVO)
        {
            StorageObjectCriteria newSto = new StorageObjectCriteria();
            long idBaseSto;
            var getOldBase = ADO.StorageObjectADO.GetInstant().Get(reqVO.bstoCode, reqVO.warehouseID, reqVO.areaID, false, true, BuVO);
            if (getOldBase != null)
            {
                var baseSto = getOldBase.ToTreeList().Find(x => x.type == StorageObjectType.BASE);
                idBaseSto = baseSto.id.Value;
            }
            else
            {
                var newBaseStoTReq = new MappingNewBaseAndSTO.TReq()
                {
                    baseCode = reqVO.bstoCode,
                    warehouseID = reqVO.warehouseID,
                    areaID = reqVO.areaID,
                    locationID = reqVO.locationID
                };
                var newbase = new MappingNewBaseAndSTO().Execute(this.Logger, this.BuVO, newBaseStoTReq); ;
                idBaseSto = newbase.id.Value;
            }
            return idBaseSto;
        }

         
    }
}
