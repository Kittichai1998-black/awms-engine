using AMWUtil.Common;
using AWMSEngine.Engine;
using AWMSEngine.Engine.Business.Received;
using AWMSEngine.Engine.V2.Business;
using AWMSEngine.Engine.V2.Business.Document;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectMRK.Engine.Business.Received
{
    public class CreateGRDocument : BaseEngine<CreateGRDocument.TReq, amt_Document>
    {
        public class TReq
        {
            public string refID;
            public long? forCustomerID;
            public string forCustomerCode;
            public string orderNo;
            public string batch;
            public string lot;

            public long? souSupplierID;
            public long? souCustomerID;
            public long? souBranchID;//สาขาต้นทาง
            public long? souWarehouseID;//คลังต้นทาง
            public long? souAreaMasterID;//พื้นที่วางสินสินค้าต้นทาง
            public string souSupplierCode;
            public string souCustomerCode;
            public string souBranchCode;//สาขาต้นทาง
            public string souWarehouseCode;//คลังต้นทาง
            public string souAreaMasterCode;//พื้นที่วางสินสินค้าต้นทาง

            public long? desBranchID;//สาขาต้นทาง
            public long? desWarehouseID;//คลังต้นทาง
            public long? desAreaMasterID;//พื้นที่วางสินสินค้าต้นทาง
            public string desBranchCode;//สาขาต้นทาง
            public string desWarehouseCode;//คลังต้นทาง
            public string desAreaMasterCode;//พื้นที่วางสินสินค้าต้นทาง

            public DateTime? actionTime;//วันที่ส่ง
            public DateTime documentDate;
            public string remark;
            public string ref1;
            public string ref2;
            public DocumentProcessTypeID movementTypeID;

            public DocumentEventStatus eventStatus = DocumentEventStatus.NEW;

            public List<ReceiveItem> receiveItems;
            public class ReceiveItem
            {
                public string skuCode;
                public string packCode;
                public decimal? quantity;
                public string unitType;

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
                    public decimal quantity;
                    public string options;
                    public bool isRegisBaseCode;
                }
            }
        }
        protected override amt_Document ExecuteEngine(TReq reqVO)
        {
            long? Sou_Customer_ID = reqVO.souCustomerID.HasValue ? reqVO.souCustomerID.Value :
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

            var doc = new CreateDocument().Execute(this.Logger, this.BuVO,
                new CreateDocument.TReq()
                {
                    lot = reqVO.lot,
                    batch = reqVO.batch,
                    forCustomerID =
                    reqVO.forCustomerID.HasValue ? reqVO.forCustomerID.Value :
                    string.IsNullOrWhiteSpace(reqVO.forCustomerCode) ? null : this.StaticValue.Customers.First(x => x.Code == reqVO.forCustomerCode).ID,

                    souCustomerID = Sou_Customer_ID,
                    souSupplierID = Sou_Supplier_ID,
                    souBranchID = Sou_Branch_ID == null ? null : Sou_Branch_ID.ID,
                    souWarehouseID = Sou_Warehouse_ID == null ? null : Sou_Warehouse_ID.ID,
                    souAreaMasterID = Sou_AreaMaster_ID == null ? null : Sou_AreaMaster_ID.ID,


                    desBranchID = Des_Branch_ID == null ? null : Des_Branch_ID.ID,
                    desWarehouseID = Des_Warehouse_ID == null ? null : Des_Warehouse_ID.ID,
                    desAreaMasterID = Des_AreaMaster_ID == null ? null : Des_AreaMaster_ID.ID,
                    documentDate = reqVO.documentDate,
                    actionTime = reqVO.actionTime ?? reqVO.documentDate,

                    refID = reqVO.refID,
                    ref1 = reqVO.ref1,
                    ref2 = reqVO.ref2,

                    docTypeId = DocumentTypeID.GOODS_RECEIVED,
                    eventStatus = reqVO.eventStatus,
                    documentProcessTypeID = reqVO.movementTypeID,
                    remark = reqVO.remark,

                    Items = reqVO.receiveItems.Select(
                        x => new CreateDocument.TReq.Item
                        {
                            skuCode = x.skuCode,
                            packCode = x.packCode,

                            quantity = x.quantity,
                            unitType = x.unitType,

                            orderNo = x.orderNo,
                            batch = x.batch,
                            lot = x.lot,
                            options = x.options,
                            expireDate = x.expireDate,
                            productionDate = x.productionDate,
                            ref1 = x.ref1,
                            ref2 = x.ref2,
                            refID = x.refID,

                            eventStatus = x.eventStatus,
                            docItemStos = x.docItemStos,
                            baseStos = x.baseStos == null ? new List<CreateDocument.TReq.Item.BaseSto>() : x.baseStos.Select(y => new CreateDocument.TReq.Item.BaseSto()
                            {
                                baseCode = y.baseCode,
                                areaCode = y.areaCode,
                                quantity = y.quantity,
                                options = y.options,
                                isRegisBaseCode = y.isRegisBaseCode
                            }).ToList()
                        }).ToList()
                });

            var scanmapsto = new ScanMapStoNoDoc();

            doc.DocumentItems.ForEach(docItem =>
            {

                var getQty = Convert.ToDecimal(AMWUtil.Common.ObjectUtil.QryStrGetValue(docItem.Options, "perpallet"));

                decimal loopTime = Math.Ceiling(docItem.BaseQuantity.Value / getQty);
                decimal remain = docItem.BaseQuantity.Value % getQty;


                for (int i = 0; i < loopTime; i++)
                {
                    var getBaseCode = AMWUtil.Common.ObjectUtil.GenUniqID();
                    var genBase = AWMSEngine.ADO.DataADO.GetInstant().Insert<ams_BaseMaster>(this.BuVO, new ams_BaseMaster()
                    {
                        Code = getBaseCode,
                        Name = getBaseCode,
                        BaseMasterType_ID = 6,
                        Description = "Pallet",
                        ObjectSize_ID = StaticValue.ObjectSizes.FirstOrDefault(x => x.ObjectType == StorageObjectType.BASE).ID.Value,
                        Status = EntityStatus.ACTIVE,
                        UnitType_ID = 1,
                        WeightKG = null
                    }).Value;

                    var baseSto = new StorageObjectCriteria()
                    {
                        code = getBaseCode,
                        eventStatus = StorageObjectEventStatus.NEW,
                        name = "Pallet",
                        qty = 1,
                        unitCode = StaticValue.UnitTypes.FirstOrDefault(x => x.ObjectType == StorageObjectType.BASE).Code,
                        unitID = StaticValue.UnitTypes.FirstOrDefault(x => x.ObjectType == StorageObjectType.BASE).ID.Value,
                        baseUnitCode = StaticValue.UnitTypes.FirstOrDefault(x => x.ObjectType == StorageObjectType.BASE).Code,
                        baseUnitID = StaticValue.UnitTypes.FirstOrDefault(x => x.ObjectType == StorageObjectType.BASE).ID.Value,
                        baseQty = 1,
                        objectSizeID = StaticValue.ObjectSizes.FirstOrDefault(x => x.ObjectType == StorageObjectType.BASE).ID.Value,
                        type = StorageObjectType.BASE,
                        mstID = genBase,
                        objectSizeName = StaticValue.ObjectSizes.FirstOrDefault(x => x.ObjectType == StorageObjectType.BASE).Name,
                    };
                    var baseStoID = AWMSEngine.ADO.StorageObjectADO.GetInstant().PutV2(baseSto, this.BuVO);

                    var mapSto = new StorageObjectCriteria();
                    if (i == loopTime - 1 && remain > 0)
                    {
                        mapSto = new StorageObjectCriteria()
                        {
                            parentID = baseSto.id.Value,
                            parentType = StorageObjectType.BASE,
                            code = docItem.Code,
                            eventStatus = StorageObjectEventStatus.NEW,
                            name = docItem.Code,
                            batch = docItem.Batch,
                            orderNo = docItem.OrderNo,
                            lot = docItem.Lot,
                            qty = remain,
                            skuID = docItem.SKUMaster_ID,
                            unitCode = StaticValue.UnitTypes.FirstOrDefault(x => x.ID == docItem.UnitType_ID).Code,
                            unitID = StaticValue.UnitTypes.FirstOrDefault(x => x.ID == docItem.UnitType_ID).ID.Value,
                            baseUnitCode = StaticValue.UnitTypes.FirstOrDefault(x => x.ID == docItem.BaseUnitType_ID).Code,
                            baseUnitID = StaticValue.UnitTypes.FirstOrDefault(x => x.ID == docItem.BaseUnitType_ID).ID.Value,
                            baseQty = remain,
                            objectSizeID = StaticValue.ObjectSizes.FirstOrDefault(x => x.ObjectType == StorageObjectType.PACK).ID.Value,
                            type = StorageObjectType.PACK,
                            productDate = docItem.ProductionDate,
                            objectSizeName = StaticValue.ObjectSizes.FirstOrDefault(x => x.ObjectType == StorageObjectType.PACK).Name,
                            mstID = docItem.PackMaster_ID
                        };
                    }
                    else
                    {
                        mapSto  = new StorageObjectCriteria()
                        {
                            parentID = baseSto.id.Value,
                            parentType = StorageObjectType.BASE,
                            code = docItem.Code,
                            eventStatus = StorageObjectEventStatus.NEW,
                            name = docItem.Code,
                            batch = docItem.Batch,
                            orderNo = docItem.OrderNo,
                            lot = docItem.Lot,
                            qty = getQty,
                            skuID = docItem.SKUMaster_ID,
                            unitCode = StaticValue.UnitTypes.FirstOrDefault(x => x.ID == docItem.UnitType_ID).Code,
                            unitID = StaticValue.UnitTypes.FirstOrDefault(x => x.ID == docItem.UnitType_ID).ID.Value,
                            baseUnitCode = StaticValue.UnitTypes.FirstOrDefault(x => x.ID == docItem.BaseUnitType_ID).Code,
                            baseUnitID = StaticValue.UnitTypes.FirstOrDefault(x => x.ID == docItem.BaseUnitType_ID).ID.Value,
                            baseQty = getQty,
                            objectSizeID = StaticValue.ObjectSizes.FirstOrDefault(x => x.ObjectType == StorageObjectType.PACK).ID.Value,
                            type = StorageObjectType.PACK,
                            productDate = docItem.ProductionDate,
                            objectSizeName = StaticValue.ObjectSizes.FirstOrDefault(x => x.ObjectType == StorageObjectType.PACK).Name,
                            mstID = docItem.PackMaster_ID
                        };
                    }

                    var packStoID = AWMSEngine.ADO.StorageObjectADO.GetInstant().PutV2(mapSto, this.BuVO);

                    if (Sou_Customer_ID.HasValue)
                    {
                        AWMSEngine.ADO.DataADO.GetInstant().UpdateByID<amt_StorageObject>(packStoID, this.BuVO, new KeyValuePair<string, object>[]{
                        new KeyValuePair<string, object>("For_Customer_ID", Sou_Customer_ID.Value)
                        });
                    }

                    var disto = new amt_DocumentItemStorageObject()
                    {
                        DocumentItem_ID = docItem.ID,
                        Sou_StorageObject_ID = packStoID,
                        BaseQuantity = Convert.ToDecimal(mapSto.qty),
                        BaseUnitType_ID = docItem.BaseUnitType_ID.Value,
                        Quantity = Convert.ToDecimal(mapSto.qty),
                        UnitType_ID = docItem.UnitType_ID.Value,
                        Status = EntityStatus.INACTIVE
                    };

                    AWMSEngine.ADO.DocumentADO.GetInstant().InsertMappingSTO(disto, this.BuVO);
                }
            });





            return doc;
        }
    }
}
