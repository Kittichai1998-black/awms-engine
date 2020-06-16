using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.Auditor
{
    public class CreateADDocument : BaseEngine<CreateADDocument.TReq, amt_Document>
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
            public string options;
            public DocumentProcessTypeID documentProcessTypeID;

            public DocumentEventStatus eventStatus = DocumentEventStatus.NEW;

            public List<TItem> docItems;
            public class TItem
            {
                public long? skuID;
                public string skuCode;
                public string packCode;
                //public int? packItemQty;
                public decimal? quantity;
                public string unitType;
                //public decimal baseQuantity;
                //public string baseUnitType;

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
            }
        }
        protected override amt_Document ExecuteEngine(TReq reqVO)
        {
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
                ParentDocument_ID = null,
                Lot = reqVO.lot,
                Batch = reqVO.batch,
                For_Customer_ID =
                    reqVO.forCustomerID.HasValue ? reqVO.forCustomerID.Value :
                    string.IsNullOrWhiteSpace(reqVO.forCustomerCode) ? null : this.StaticValue.Customers.First(x => x.Code == reqVO.forCustomerCode).ID,

                Sou_Customer_ID = Sou_Customer_ID,
                Sou_Supplier_ID = Sou_Supplier_ID,
                Sou_Branch_ID = Sou_Branch_ID == null ? null : Sou_Branch_ID.ID,
                Sou_Warehouse_ID = Sou_Warehouse_ID == null ? null : Sou_Warehouse_ID.ID,
                Sou_AreaMaster_ID = Sou_AreaMaster_ID == null ? null : Sou_AreaMaster_ID.ID,

                Des_Customer_ID = null,
                Des_Supplier_ID = null,
                Des_Branch_ID = Des_Branch_ID == null ? null : Des_Branch_ID.ID,
                Des_Warehouse_ID = Des_Warehouse_ID == null ? null : Des_Warehouse_ID.ID,
                Des_AreaMaster_ID = Des_AreaMaster_ID == null ? null : Des_AreaMaster_ID.ID,
                DocumentDate = reqVO.documentDate,
                ActionTime = reqVO.actionTime ?? reqVO.documentDate,

                RefID = reqVO.refID,
                Ref1 = reqVO.ref1,
                Ref2 = reqVO.ref2,

                DocumentType_ID = DocumentTypeID.AUDIT,
                DocumentProcessType_ID = reqVO.documentProcessTypeID,
                EventStatus = reqVO.eventStatus,

                Remark = reqVO.remark,
                Options = null,
                Transport_ID = null,

                DocumentItems = new List<amt_DocumentItem>(),

            };

            foreach (var docItem in reqVO.docItems)
            {

                ams_PackMaster packMst = null;
                ams_SKUMaster skuMst = null;

                if (!string.IsNullOrWhiteSpace(docItem.packCode))
                {
                    packMst = ADO.MasterADO.GetInstant().GetPackMasterByPack(docItem.packCode, docItem.unitType, this.BuVO);
                    skuMst = ADO.DataADO.GetInstant().SelectByID<ams_SKUMaster>(packMst.SKUMaster_ID, this.BuVO);
                }
                else if (docItem.skuID.HasValue)
                {
                    skuMst = ADO.DataADO.GetInstant().SelectByID<ams_SKUMaster>(docItem.skuID, this.BuVO);
                    packMst = ADO.MasterADO.GetInstant().GetPackMasterBySKU(skuMst.ID.Value, docItem.unitType, this.BuVO);
                }
                else if (!string.IsNullOrWhiteSpace(docItem.skuCode))
                {
                    skuMst = ADO.DataADO.GetInstant().SelectByCodeActive<ams_SKUMaster>(docItem.skuCode, this.BuVO);
                    packMst = ADO.MasterADO.GetInstant().GetPackMasterBySKU(skuMst.ID.Value, docItem.unitType, this.BuVO);
                }

                //var mainUnitType = this.StaticValue.UnitTypes.First(x => x.Code == recItem.packItemUnit);
                ConvertUnitCriteria baseUnitTypeConvt = packMst == null ? null : this.StaticValue.ConvertToBaseUnitBySKU(skuMst.ID.Value, docItem.quantity ?? 1, skuMst.UnitType_ID.Value);
                
                doc.DocumentItems.Add(new amt_DocumentItem()
                {
                    ID = null,
                    Code = skuMst != null ? skuMst.Code : string.Empty,
                    SKUMaster_ID = skuMst != null ? skuMst.ID : null,
                    PackMaster_ID = packMst != null ? packMst.ID : null,

                    UnitType_ID = baseUnitTypeConvt == null ? null : (long?)baseUnitTypeConvt.newUnitType_ID,
                    BaseUnitType_ID = baseUnitTypeConvt == null ? null : (long?)baseUnitTypeConvt.baseUnitType_ID,

                    OrderNo = docItem.orderNo,
                    Batch = docItem.batch,
                    Lot = docItem.lot,

                    Options = docItem.options,
                    ExpireDate = docItem.expireDate,
                    ProductionDate = docItem.productionDate,
                    Ref1 = docItem.ref1,
                    Ref2 = docItem.ref2,
                    RefID = docItem.refID,

                    EventStatus = docItem.eventStatus,
                    DocItemStos = docItem.docItemStos
                });
            }


            doc = ADO.DocumentADO.GetInstant().Create(doc, BuVO);

            return doc;
        }
    }
}
