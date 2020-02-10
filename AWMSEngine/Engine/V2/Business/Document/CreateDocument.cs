﻿using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.ADO.StaticValue;
using AWMSEngine.Common;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.Document
{
    public class CreateDocument : BaseEngine<CreateDocument.TReq, amt_Document>
    {
        public class TReq
        {
            public long? parentDocumentID;
            public DocumentTypeID docTypeId;

            public long? souCustomerID;//ผู้ผลิตต้นทาง
            public long? souSupplierID;//ผู้จัดจำหน่ายต้นทาง
            public long? souBranchID;//สาขาต้นทาง
            public long? souWarehouseID;//คลังต้นทาง
            public long? souAreaMasterID;//พื้นที่วางสินสินค้าต้นทาง

            public string souCustomerCode;//ผู้ผลิตต้นทาง
            public string souSupplierCode;//ผู้จัดจำหน่ายต้นทาง
            public string souBranchCode;//สาขาต้นทาง
            public string souWarehouseCode;//คลังต้นทาง
            public string souAreaMasterCode;//พื้นที่วางสินสินค้าต้นทาง

            public long? desCustomerID;//ผู้ผลิตปลายทาง
            public long? desSupplierID;//ผู้จัดจำหน่ายปลายทาง
            public long? desBranchID;//สาขาปลายทาง
            public long? desWarehouseID;//คลังปลายทาง
            public long? desAreaMasterID;//พื้นที่วางสินสินค้าปลายทาง

            public string desCustomerCode;//ผู้ผลิตปลายทางง
            public string desSupplierCode;//ผู้จัดจำหน่ายปลายทาง
            public string desBranchCode;//สาขาปลายทาง
            public string desWarehouseCode;//คลังปลายทาง
            public string desAreaMasterCode;//พื้นที่วางสินสินค้าปลายทาง

            public long? forCustomerID;
            public string forCustomerCode;
            public int? transportID;
            public DocumentProcessTypeID documentProcessTypeID;

            public string batch;
            public string lot;
            public string options;
            public string remark;

            public DateTime? actionTime;//วันที่ส่ง
            public DateTime documentDate;
            public DocumentEventStatus eventStatus = DocumentEventStatus.NEW;

            public string refID;
            public string ref1;
            public string ref2;

            public List<Item> Items;
            public class Item
            {
                public string skuCode;
                public string packCode;
                public long? packID;
                public int? packItemQty; //not receive
                public decimal? quantity;
                public string unitType;
                public decimal? baseQuantity; //not receive
                public string baseUnitType; //not receive

                public DateTime? expireDate;
                public DateTime? productionDate;

                public string orderNo;
                public string batch;
                public string lot;

                public string ref1;
                public string ref2;
                public string refID;
                public string options;

                public DocumentEventStatus eventStatus = DocumentEventStatus.NEW;

                public List<amt_DocumentItemStorageObject> docItemStos;
                public List<BaseSto> baseStos;
                public class BaseSto
                {
                    public string baseCode;
                    public string areaCode;
                    public decimal? quantity;
                    public string options;
                    public bool? isRegisBaseCode;
                }
            }
        }
        protected override amt_Document ExecuteEngine(TReq reqVO)
        {
            exceFullClass(reqVO, FeatureCode.EXEWM_CreateDocument_Exec_Before);

            long? Sou_Customer_ID =
                    reqVO.souCustomerID.HasValue ? reqVO.souCustomerID.Value :
                    string.IsNullOrWhiteSpace(reqVO.souCustomerCode) ? null : this.StaticValue.Customers.First(x => x.Code == reqVO.souCustomerCode).ID;
            long? Sou_Supplier_ID =
                    reqVO.souSupplierID.HasValue ? reqVO.souSupplierID.Value :
                    string.IsNullOrWhiteSpace(reqVO.souSupplierCode) ? null : this.StaticValue.Suppliers.First(x => x.Code == reqVO.souSupplierCode).ID;
            var Sou_AreaMaster_ID = this.StaticValue.GetAreaMaster(
                                                    reqVO.souAreaMasterID,
                                                    reqVO.souAreaMasterCode);
            var Sou_Warehouse_ID = this.StaticValue.GetWarehouse(
                                                    reqVO.souWarehouseID,
                                                    reqVO.souAreaMasterID,
                                                    reqVO.souWarehouseCode,
                                                    reqVO.souAreaMasterCode);
            var Sou_Branch_ID = this.StaticValue.GetBranch(
                                                    reqVO.souBranchID,
                                                    reqVO.souWarehouseID,
                                                    reqVO.souAreaMasterID,
                                                    reqVO.souBranchCode,
                                                    reqVO.souWarehouseCode,
                                                    reqVO.souAreaMasterCode);

            var Des_Customer_ID =
                reqVO.desCustomerID.HasValue ? reqVO.desCustomerID.Value :
                string.IsNullOrWhiteSpace(reqVO.desCustomerCode) ? null : this.StaticValue.Customers.First(x => x.Code == reqVO.desCustomerCode).ID;
            var Des_Supplier_ID =
                reqVO.desSupplierID.HasValue ? reqVO.desSupplierID.Value :
                string.IsNullOrWhiteSpace(reqVO.desSupplierCode) ? null : this.StaticValue.Suppliers.First(x => x.Code == reqVO.desSupplierCode).ID;
            var Des_AreaMaster_ID = this.StaticValue.GetAreaMaster(
                                                    reqVO.desAreaMasterID,
                                                    reqVO.desAreaMasterCode);
            var Des_Warehouse_ID = this.StaticValue.GetWarehouse(
                                                    reqVO.desWarehouseID,
                                                    reqVO.desAreaMasterID,
                                                    reqVO.desWarehouseCode,
                                                    reqVO.desAreaMasterCode);
            var Des_Branch_ID = this.StaticValue.GetBranch(
                                                    reqVO.desBranchID,
                                                    reqVO.desWarehouseID,
                                                    reqVO.desAreaMasterID,
                                                    reqVO.desBranchCode,
                                                    reqVO.desWarehouseCode,
                                                    reqVO.desAreaMasterCode);
            amt_Document doc = new amt_Document()
            {
                ID = null,
                Code = null,
                ParentDocument_ID = reqVO.parentDocumentID,
                DocumentType_ID = reqVO.docTypeId,

                Sou_Customer_ID = Sou_Customer_ID,
                Sou_Supplier_ID = Sou_Supplier_ID,
                Sou_Branch_ID = Sou_Branch_ID == null ? null : Sou_Branch_ID.ID,
                Sou_Warehouse_ID = Sou_Warehouse_ID == null ? null : Sou_Warehouse_ID.ID,
                Sou_AreaMaster_ID = Sou_AreaMaster_ID == null ? null : Sou_AreaMaster_ID.ID,

                Des_Customer_ID = Des_Customer_ID,
                Des_Supplier_ID = Des_Supplier_ID,
                Des_Branch_ID = Des_Branch_ID == null ? null : Des_Branch_ID.ID,
                Des_Warehouse_ID = Des_Warehouse_ID == null ? null : Des_Warehouse_ID.ID,
                Des_AreaMaster_ID = Des_AreaMaster_ID == null ? null : Des_AreaMaster_ID.ID,

                For_Customer_ID =
                reqVO.forCustomerID.HasValue ? reqVO.forCustomerID.Value :
                string.IsNullOrWhiteSpace(reqVO.forCustomerCode) ? null : this.StaticValue.Customers.First(x => x.Code == reqVO.forCustomerCode).ID,
                Transport_ID = reqVO.transportID,
                DocumentProcessType_ID = reqVO.documentProcessTypeID,
                Batch = reqVO.batch,
                Lot = reqVO.lot,
                Options = reqVO.options,
                Remark = reqVO.remark,

                ActionTime = reqVO.actionTime ?? reqVO.documentDate,
                DocumentDate = reqVO.documentDate,
                EventStatus = reqVO.eventStatus,

                RefID = reqVO.refID,
                Ref1 = reqVO.ref1,
                Ref2 = reqVO.ref2,

                DocumentItems = new List<amt_DocumentItem>(),
            };

            foreach (var Item in reqVO.Items)
            {
                ams_PackMaster packMst = null;
                ams_SKUMaster skuMst = null;
                decimal? baseQuantity = null;

                if (Item.packID.HasValue)
                {
                    packMst = ADO.DataADO.GetInstant().SelectByID<ams_PackMaster>(Item.packID, this.BuVO);
                    if (packMst == null)
                        throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบ Pack:" + Item.packCode + " / Unit:" + Item.unitType + " ในระบบ");
                    skuMst = ADO.DataADO.GetInstant().SelectByID<ams_SKUMaster>(packMst.SKUMaster_ID, this.BuVO);
                    if (skuMst == null)
                        throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบ Pack:" + Item.packCode + " ในระบบ");
                }
                else if (!string.IsNullOrWhiteSpace(Item.packCode))
                {
                    packMst = ADO.MasterADO.GetInstant().GetPackMasterByPack(Item.packCode, Item.unitType, this.BuVO);
                    if (packMst == null)
                        throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบข้อมูลสินค้าใน SKU Master");
                    skuMst = ADO.DataADO.GetInstant().SelectByID<ams_SKUMaster>(packMst.SKUMaster_ID, this.BuVO);
                }
                else if (!string.IsNullOrWhiteSpace(Item.skuCode))
                {
                    skuMst = ADO.DataADO.GetInstant().SelectByCodeActive<ams_SKUMaster>(Item.skuCode, this.BuVO);
                    if (skuMst == null)
                        throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบข้อมูลสินค้าใน SKU Master");
                    packMst = ADO.MasterADO.GetInstant().GetPackMasterBySKU(skuMst.ID.Value, Item.unitType, this.BuVO);
                }
                else if (!Item.options.Contains("basecode"))
                {
                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "กรุณาส่ง packCode หรือ skuCode,packItemQty หรือ palletCode");
                }
                ConvertUnitCriteria baseUnitTypeConvt = null;
                if (Item.quantity.HasValue && packMst != null)
                {
                    baseUnitTypeConvt = this.StaticValue.ConvertToBaseUnitByPack(packMst.ID.Value, Item.quantity.Value, packMst.UnitType_ID);
                    baseQuantity = baseUnitTypeConvt.baseQty;
                }

                if (Item.baseStos.Count > 0)
                {
                    foreach (var Sto in MappingSto(Item))
                    {
                        if (Item.docItemStos == null)
                            Item.docItemStos = new List<amt_DocumentItemStorageObject>();

                        List<amt_DocumentItemStorageObject> disto = Sto.mapstos.Select(x => new amt_DocumentItemStorageObject()
                        {
                            Sou_StorageObject_ID = x.id.Value,
                            Des_StorageObject_ID = null,
                            Quantity = StaticValue.ConvertToBaseUnitBySKU(skuMst.ID.Value, x.qty, x.unitID).newQty,
                            BaseQuantity = StaticValue.ConvertToBaseUnitBySKU(skuMst.ID.Value, x.qty, x.unitID).baseQty,
                            UnitType_ID = StaticValue.ConvertToBaseUnitBySKU(skuMst.ID.Value, x.qty, x.unitID).newUnitType_ID,
                            BaseUnitType_ID = StaticValue.ConvertToBaseUnitBySKU(skuMst.ID.Value, x.qty, x.unitID).baseUnitType_ID,
                            Status = EntityStatus.INACTIVE
                        }).ToList();
                        Item.docItemStos.AddRange(disto);
                    };
                }

                doc.DocumentItems.Add(new amt_DocumentItem()
                {
                    ID = null,
                    Code = skuMst != null ? skuMst.Code : ObjectUtil.QryStrGetValue(Item.options,"basecode"),
                    SKUMaster_ID = skuMst != null ? skuMst.ID : null,
                    PackMaster_ID = packMst != null ? packMst.ID : null,

                    Quantity = Item.quantity,
                    UnitType_ID = baseUnitTypeConvt != null ? (long?)baseUnitTypeConvt.oldUnitType_ID : null,
                    BaseQuantity = baseQuantity,
                    BaseUnitType_ID = baseUnitTypeConvt != null ? (long?)baseUnitTypeConvt.baseUnitType_ID : null,

                    OrderNo = Item.orderNo,
                    Batch = Item.batch,
                    Lot = Item.lot,

                    Options = Item.options,
                    ExpireDate = Item.expireDate,
                    ProductionDate = Item.productionDate,
                    Ref1 = Item.ref1,
                    Ref2 = Item.ref2,
                    RefID = Item.refID,

                    EventStatus = Item.eventStatus,
                    DocItemStos = Item.docItemStos
                });
            }
            doc = ADO.DocumentADO.GetInstant().Create(doc, BuVO);

            exceFullClass(reqVO, FeatureCode.EXEWM_CreateDocument_Exec_After);

            return doc;
        }
        private void exceFullClass(TReq reqVO, FeatureCode featureCode)
        {
            this.ExectProject<TReq, amt_Document>(featureCode, reqVO);
        }

        private List<StorageObjectCriteria> MappingSto(TReq.Item reqVO)
        {
            List<StorageObjectCriteria> mapStos = new List<StorageObjectCriteria>();
            foreach (var baseSto in reqVO.baseStos)
            {
                ams_BaseMaster bm = ADO.DataADO.GetInstant().SelectByCodeActive<ams_BaseMaster>(baseSto.baseCode, this.BuVO);
                var areaModel = StaticValue.AreaMasters.FirstOrDefault(x => x.Code == baseSto.areaCode);
                if (bm == null && baseSto.isRegisBaseCode.Value)
                {
                    AWMSEngine.ADO.DataADO.GetInstant().Insert<ams_BaseMaster>(this.BuVO, new ams_BaseMaster()
                    {
                        Code = baseSto.baseCode,
                        Name = baseSto.baseCode,
                        BaseMasterType_ID = 6,
                        Description = "Pallet",
                        ObjectSize_ID = StaticValue.ObjectSizes.FirstOrDefault(x => x.ObjectType == StorageObjectType.BASE).ID.Value,
                        Status = EntityStatus.ACTIVE,
                        UnitType_ID = 1,
                        WeightKG = null
                    });
                }
                else if (bm == null && !baseSto.isRegisBaseCode.Value)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "BaseCode : " + baseSto.baseCode + " Not Found");

                var mapBaseSto = new ScanMapStoNoDoc().Execute(this.Logger, this.BuVO,
                new ScanMapStoNoDoc.TReq()
                {
                    rootID = null,
                    scanCode = baseSto.baseCode,
                    orderNo = null,
                    batch = null,
                    lot = null,
                    amount = 1,
                    unitCode = null,
                    productDate = null,
                    warehouseID = areaModel.Warehouse_ID,
                    areaID = areaModel.ID,
                    locationCode = null,
                    options = null,
                    isRoot = true,
                    mode = VirtualMapSTOModeType.REGISTER,
                    action = VirtualMapSTOActionType.ADD,
                });

                var mapSto = new ScanMapStoNoDoc().Execute(this.Logger, this.BuVO,
                    new ScanMapStoNoDoc.TReq()
                    {
                        rootID = mapBaseSto.id,
                        scanCode = reqVO.packCode,
                        orderNo = reqVO.orderNo,
                        batch = reqVO.batch,
                        lot = reqVO.lot,
                        amount = baseSto.quantity.Value,
                        unitCode = reqVO.unitType,
                        productDate = reqVO.productionDate,
                        warehouseID = areaModel.Warehouse_ID,
                        areaID = areaModel.ID,
                        locationCode = null,
                        options = baseSto.options,
                        isRoot = false,
                        mode = VirtualMapSTOModeType.REGISTER,
                        action = VirtualMapSTOActionType.ADD,
                    });
                mapStos.Add(mapSto);
            }
            return mapStos;
        }
    }
}
