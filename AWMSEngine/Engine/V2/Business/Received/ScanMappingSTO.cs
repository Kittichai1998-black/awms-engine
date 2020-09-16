using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.ADO;
using AWMSEngine.ADO.StaticValue;
using AWMSEngine.Engine.V2.Business.Document;
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
                public long? forCustomerID;
                public string options;
                public decimal addQty;
                public string unitTypeCode; // old unit 
                public string packUnitTypeCode;
                public AuditStatus? auditStatus;
                public DateTime? expiryDate;
                public DateTime? incubationDate;
                public DateTime? productDate;
                public DateTime? shelfLifeDate;
            }
            

        }
        public class TRes 
        {
            public StorageObjectCriteria bsto;
            public List<MappingDistoAndDocumentItem.TRes> pstos;
        }
        protected override TRes ExecuteEngine(TReq reqVO)
        {
            var res = new TRes();
            StorageObjectCriteria mapsto = null;
            var docprocessMaster = ADO.DataADO.GetInstant().SelectBy<ams_DocumentProcessMap>(new SQLConditionCriteria[] {
                        new SQLConditionCriteria("DocumentProcessType_ID", reqVO.processType, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("DocumentType_ID", DocumentTypeID.GOODS_RECEIVE, SQLOperatorType.EQUALS)
                    }, BuVO).FirstOrDefault();

            if (docprocessMaster == null)
                throw new AMWException(Logger, AMWExceptionCode.V1001, "ไม่สามารถสร้างเอกสารรับเข้าด้วย Document Process Type : " + reqVO.processType + "นี้ได้");


            if (reqVO.bstoID == null)
            {
                //ไม่ระบุ bstoID ต้องเอา bstoCode ไปเช็คว่ามีมั้ย ถ้ามี getSto ไม่มีสร้าง sto base ใหม่ 
                if (!String.IsNullOrEmpty(reqVO.bstoCode))
                {
                    mapsto = this.ADOSto.Get(reqVO.bstoCode, null, null, false, true, this.BuVO);

                    StaticValueManager.GetInstant().LoadUnitType(BuVO);

                    if (reqVO.pstos != null && reqVO.pstos.Count() > 0)
                    {
                        List<MappingDistoAndDocumentItem.TRes> tempMapping = new List<MappingDistoAndDocumentItem.TRes>();
                        long? idBase = null;
                        if (mapsto == null)
                        {
                            //สร้างใหม่
                            idBase = GetBaseSTO(reqVO);
                        }
                        else
                        {
                            idBase = mapsto.id.Value;
                        }
                        //map packsto
                        reqVO.pstos.ForEach(psto =>
                        {
                            tempMapping.Add(createSTO(psto, idBase.Value));
                        });
                        res.pstos = tempMapping;
                        res.bsto = this.ADOSto.Get(idBase.Value, StorageObjectType.BASE, false, true, this.BuVO);
                        
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
                            mapsto = new StorageObjectCriteria() {
                                code = reqVO.bstoCode,
                                eventStatus = StorageObjectEventStatus.ACTIVE,
                                name = "Pallet",
                                parentID = reqVO.areaID,
                                parentType = StorageObjectType.LOCATION,
                                qty = 1,
                                baseQty = 1,
                                unitID = _unitType.ID.Value,
                                baseUnitID = _unitType.ID.Value,
                                unitCode = _unitType.Code,
                                baseUnitCode = _unitType.Code,
                                type = StorageObjectType.BASE,
                                areaID = reqVO.areaID,
                                warehouseID = reqVO.warehouseID,
                                mstID = checkBaseMaster.ID.Value,
                            };
                            res.bsto = mapsto;
                        }
                        else
                        {
                            if (mapsto.warehouseID != reqVO.warehouseID)
                                throw new AMWException(this.Logger, AMWExceptionCode.V1002, "Warehouse ไม่ถูกต้อง");
                            if (mapsto.areaID != reqVO.areaID)
                                throw new AMWException(this.Logger, AMWExceptionCode.V1002, "Area ไม่ถูกต้อง");


                            res.bsto = this.ADOSto.Get(mapsto.id.Value, StorageObjectType.BASE, false, true, this.BuVO); ;

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
                    List<MappingDistoAndDocumentItem.TRes> tempMapping = new List<MappingDistoAndDocumentItem.TRes>();

                    reqVO.pstos.ForEach(psto =>
                    {
                        tempMapping.Add(createSTO(psto, idBase));
                    });
                    res.pstos = tempMapping; 
                }

                res.bsto = this.ADOSto.Get(reqVO.bstoID.Value, StorageObjectType.BASE, false, true, this.BuVO);
            }

            StorageObjectCriteria createBaseSTO(string bastCode)
            {
                var checkBaseMaster = AWMSEngine.ADO.DataADO.GetInstant().SelectByCodeActive<ams_BaseMaster>(reqVO.bstoCode, BuVO);
                if (checkBaseMaster == null)
                {
                    throw new AMWException(Logger, AMWExceptionCode.V1001, "ไม่มีข้อมูลพาเลท " + reqVO.bstoCode + " ในระบบ");
                }

                var _unitType = StaticValueManager.GetInstant().UnitTypes.FirstOrDefault(x => x.ID == checkBaseMaster.UnitType_ID);
                var mapsto = new StorageObjectCriteria()
                {
                    code = reqVO.bstoCode,
                    eventStatus = StorageObjectEventStatus.ACTIVE,
                    name = "Pallet",
                    parentID = reqVO.areaID,
                    parentType = StorageObjectType.LOCATION,
                    qty = 1,
                    baseQty = 1,
                    unitID = _unitType.ID.Value,
                    baseUnitID = _unitType.ID.Value,
                    unitCode = _unitType.Code,
                    baseUnitCode = _unitType.Code,
                    type = StorageObjectType.BASE,
                    areaID = reqVO.areaID,
                    warehouseID = reqVO.warehouseID,
                    mstID = checkBaseMaster.ID.Value,
                };
                return mapsto;
            }
            MappingDistoAndDocumentItem.TRes createSTO(TReq.PackSto psto, long idBase)
            {
                if(psto.addQty == 0)
                    throw new AMWException(Logger, AMWExceptionCode.V1002, "กรุณาระบุจำนวนสินค้า");

                var sku = ADO.DataADO.GetInstant().SelectByCodeActive<ams_SKUMaster>(psto.pstoCode, BuVO);
               
                var pack = new ams_PackMaster();
                var skutype = new ams_SKUMasterType();
                ConvertUnitCriteria unitTypeConvt = new ConvertUnitCriteria();
                if (sku == null)
                {
                    throw new AMWException(Logger, AMWExceptionCode.V1001, "ไม่พบข้อมูลสินค้า " + psto.pstoCode + " ในระบบ");
                }
                else
                {
                    skutype = StaticValueManager.GetInstant().SKUMasterTypes.FirstOrDefault(x => x.ID == sku.SKUMasterType_ID);
                    if (skutype == null)
                        throw new AMWException(Logger, AMWExceptionCode.V1001, "ไม่พบข้อมูล SKU Master Type ในระบบ");
                    var docprocessMaster = ADO.DataADO.GetInstant().SelectBy<ams_DocumentProcessType>(new SQLConditionCriteria[] {
                        new SQLConditionCriteria("ID", reqVO.processType, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("SKUGroupType", skutype.GroupType, SQLOperatorType.EQUALS)
                    }, BuVO).FirstOrDefault();
                    if (docprocessMaster == null)
                        throw new AMWException(Logger, AMWExceptionCode.V1001, "SKU นี้ไม่สามารถรับเข้าผ่าน Document Process Type : " + reqVO.processType + " นี้ได้");


                    var pack_unitType = ADO.DataADO.GetInstant().SelectByCodeActive<ams_UnitType>(psto.unitTypeCode, BuVO);
                    var base_UnitType = new ams_UnitType(); //base
                    if (String.IsNullOrEmpty(psto.packUnitTypeCode))
                    {
                        //packUnitType = ADO.DataADO.GetInstant().SelectByID<ams_UnitType>(sku.UnitType_ID.Value, BuVO);
                        unitTypeConvt = StaticValue.ConvertToNewUnitBySKU(sku.ID.Value, psto.addQty, pack_unitType.ID.Value, sku.UnitType_ID.Value);
                    }
                    else
                    {
                        base_UnitType = ADO.DataADO.GetInstant().SelectByCodeActive<ams_UnitType>(psto.packUnitTypeCode, BuVO);
                        unitTypeConvt = StaticValue.ConvertToNewUnitBySKU(sku.ID.Value, psto.addQty, pack_unitType.ID.Value, base_UnitType.ID.Value);
                    }

                    pack = ADO.DataADO.GetInstant().SelectByID<ams_PackMaster>(unitTypeConvt.newPackMaster_ID, BuVO);

                }
               
                var auditstatus = StaticValueManager.GetInstant().GetConfigValue(ConfigFlow.AUDIT_STATUS_DEFAULT, reqVO.processType);
                var _auditstatus = psto.auditStatus != null ? psto.auditStatus : EnumUtil.GetValueEnum<AuditStatus>(auditstatus);
                var holdstatus = StaticValueManager.GetInstant().GetConfigValue(ConfigFlow.HOLD_STATUS_DEFAULT, reqVO.processType);
                 
                StorageObjectCriteria newPackSto = new StorageObjectCriteria()
                {
                    type = StorageObjectType.PACK,
                    mstID = pack.ID.Value,
                    areaID = reqVO.areaID,
                    eventStatus = reqVO.processType == DocumentProcessTypeID.ESP_TRANSFER_WM ? StorageObjectEventStatus.RECEIVED : StorageObjectEventStatus.NEW,
                    parentID = idBase,
                    parentType = StorageObjectType.BASE,
                    forCustomerID = psto.forCustomerID,
                    options = psto.options,
                    orderNo = psto.orderNo,
                    batch = psto.batch,
                    lot = psto.lot,
                    cartonNo = psto.cartonNo,
                    //qty = newQty,
                    unitID = unitTypeConvt.oldUnitType_ID,
                    //baseQty = baseQty,
                    baseUnitID = unitTypeConvt.newUnitType_ID,
                    productDate = psto.productDate,
                    expiryDate = psto.expiryDate,
                    incubationDate = psto.incubationDate,
                    shelfLifeDate = psto.shelfLifeDate,
                    //refID = psto.refID,
                    ref1 = psto.ref1,
                    ref2 = psto.ref2,
                    ref3 = psto.ref3,
                    ref4 = psto.ref4,
                    itemNo = psto.itemNo,
                    AuditStatus = reqVO.processType == DocumentProcessTypeID.ESP_TRANSFER_WM ? AuditStatus.PASSED : _auditstatus.Value,
                    IsHold = reqVO.processType == DocumentProcessTypeID.ESP_TRANSFER_WM ?  false : Convert.ToBoolean(Convert.ToInt16(holdstatus))
                };
                var newPackCheckSum = newPackSto.GetCheckSum();
                newPackSto.refID = newPackCheckSum;
                //var oldPsto = this.ADOSto.Get(psto.pstoID.Value, StorageObjectType.PACK, false, false, this.BuVO);
                var stos = this.ADOSto.Get(idBase, StorageObjectType.BASE, false, true, this.BuVO);
                var stoLists = stos.ToTreeList();
                long? resStopack = null;
                if (psto.pstoID == null)
                {
                    //new pack
                    newPackSto.qty = unitTypeConvt.oldQty;
                    newPackSto.baseQty = unitTypeConvt.newQty;
                    resStopack = AWMSEngine.ADO.StorageObjectADO.GetInstant().PutV2(newPackSto, BuVO);
                }
                else
                {
                    var oldPsto = stoLists.Find(x => x.id == psto.pstoID.Value);
                    
                    if (oldPsto != null)
                    {
                        if (oldPsto.refID == newPackCheckSum)
                        {
                            //add qty
                            oldPsto.qty += unitTypeConvt.oldQty;
                            oldPsto.baseQty += unitTypeConvt.newQty;

                            if (oldPsto.qty == 0)
                            {
                                oldPsto.eventStatus = StorageObjectEventStatus.REMOVED;
                            }
                            resStopack = AWMSEngine.ADO.StorageObjectADO.GetInstant().PutV2(oldPsto, BuVO);

                            if (oldPsto.parentID.HasValue)
                                remove_parent_empty(oldPsto.parentID.Value, oldPsto.parentType.Value);
                        }
                        else
                        {
                            ////new pack
                            //newPackSto.qty = unitTypeConvt.oldQty;
                            //newPackSto.baseQty = unitTypeConvt.newQty;
                            //resStopack = AWMSEngine.ADO.StorageObjectADO.GetInstant().PutV2(newPackSto, BuVO);
                            throw new AMWException(Logger, AMWExceptionCode.V1001, "ข้อมูล RefID ไม่ตรงกัน");
                        }

                    }
                    else
                    {
                        //new pack
                        newPackSto.qty = unitTypeConvt.oldQty;
                        newPackSto.baseQty = unitTypeConvt.newQty;
                        resStopack = AWMSEngine.ADO.StorageObjectADO.GetInstant().PutV2(newPackSto, BuVO);
                    }
                }
                //call Mapping Disto And DocumentItem
                
                void remove_parent_empty(long parent_id, StorageObjectType parent_type)
                {
                    if (parent_type != StorageObjectType.LOCATION)
                    {
                        //var stoLists = res.bsto.ToTreeList();
                        if (stoLists.FindAll(x => x.parentID == parent_id && x.parentType == parent_type).TrueForAll(x => x.eventStatus == StorageObjectEventStatus.REMOVED))
                        {
                            var parentRemove = stoLists.Find(x => x.id == parent_id);

                            parentRemove.eventStatus = StorageObjectEventStatus.REMOVED;
                            ADO.StorageObjectADO.GetInstant().UpdateStatus(parentRemove.id.Value, null, null, StorageObjectEventStatus.REMOVED, this.BuVO);
                            if (parentRemove.parentID.HasValue)
                                remove_parent_empty(parentRemove.parentID.Value, parentRemove.parentType.Value);
                        }
                    }
                }
                if(reqVO.processType == DocumentProcessTypeID.ESP_TRANSFER_WM)
                {
                    return null;
                }
                else
                {
                    var reqMappingDoc = new MappingDistoAndDocumentItem.TReq()
                    {
                        packID = resStopack.Value,
                        docProcessType = reqVO.processType
                    };
                    return new MappingDistoAndDocumentItem().Execute(this.Logger, this.BuVO, reqMappingDoc); ;
                }

            } //end void createSTO


           
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
                    locationID = reqVO.locationID,
                    isEmptyPallet = reqVO.processType == DocumentProcessTypeID.ESP_TRANSFER_WM ? true : false
                };
                var newbase = new MappingNewBaseAndSTO().Execute(this.Logger, this.BuVO, newBaseStoTReq); ;
                idBaseSto = newbase.id.Value;
            }
            return idBaseSto;
        }

         
    }
}
