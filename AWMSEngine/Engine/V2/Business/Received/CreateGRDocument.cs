using AMWUtil.Exception;
using AWMSEngine.Engine.V2.Business.Document;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.Received
{
    public class CreateGRDocument : BaseEngine<CreateGRDocument.TReq, amt_Document>
    {
        public class TReq
        {
            public long? parentDocumentID;
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

            var doc = new CreateDocument().Execute(this.Logger, this.BuVO,
                new CreateDocument.TReq()
                {
                    parentDocumentID = reqVO.parentDocumentID,
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
                            packCode = null,

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
            return doc;
        }
    }
}
