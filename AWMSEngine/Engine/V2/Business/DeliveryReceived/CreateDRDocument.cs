using AMWUtil.Exception;
using AWMSEngine.Engine.V2.Business.Document;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Entity;
using AWMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;

namespace AWMSEngine.Engine.V2.Business.ReceivedOrder
{
    public class CreateDRDocument : BaseEngine<CreateDRDocument.TReq, amt_Document>
    {

        public class TReq
        {
            public long? parentDocument_ID;
            public string refID;
            public string ref1;
            public string ref2;
            public string ref3;
            public string ref4;
            public long? forCustomerID;
            public string forCustomerCode;
            public string batch;
            public string lot;
            public DocumentProcessTypeID documentProcessTypeID;
            public String documentProcessTypeCode;
            public long? souBranchID;
            public long? souWarehouseID;
            public long? souCustomerID;
            public long? souSupplierID;
            public long? souAreaMasterID;
            public string souBranchCode;//สาขาต้นทาง
            public string souWarehouseCode;//คลังต้นทาง
            public string souCustomerCode;
            public string souSupplierCode;
            public string souAreaMasterCode;//พื้นที่วางสินสินค้าต้นทาง
            public int? transportID;

            public long? desCustomerID;
            public long? desSupplierID;
            public long? desBranchID;
            public long? desWarehouseID;
            public long? desAreaMasterID;
            public string desCustomerCode;//ผู้ผลิตต้นทาง
            public string desSupplierCode;//ผู้จัดจำหน่ายต้นทาง
            public string desBranchCode;
            public string desWarehouseCode;
            public string desAreaMasterCode;

            public DateTime? actionTime;//วันที่ส่ง
            public DateTime documentDate;
            public string remark;
            public string options;

            public DocumentEventStatus eventStatus = DocumentEventStatus.NEW;

            public List<ReceivedOrderItem> receivedOrderItem;
            public class ReceivedOrderItem
            {

                public string packCode;
                public long? packID;
                public string skuCode;
                public decimal? quantity;
                public string unitType;
                public decimal? baseQuantity;
                public string baseunitType;
                public string batch;
                public string lot;
                public string orderNo;
                public string cartonNo;
                public string itemNo;
                public AuditStatus auditStatus;
                public string refID;
                public string ref1;
                public string ref2;
                public string ref3;
                public string ref4;
                public string options;
                public long? parentDocumentItem_ID;
                public long? incubationDay;

                public DateTime? expireDate;
                public DateTime? productionDate;
                public long? shelfLifeDay;


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
            var forCustomerModel = reqVO.forCustomerID.HasValue ?
                 this.StaticValue.Customers.FirstOrDefault(x => x.ID == reqVO.forCustomerID) :
                 this.StaticValue.Customers.FirstOrDefault(x => x.Code == reqVO.forCustomerCode);
            var desSupplierModel = reqVO.desSupplierID.HasValue ?
                this.StaticValue.Suppliers.FirstOrDefault(x => x.ID == reqVO.desSupplierID) :
                this.StaticValue.Suppliers.FirstOrDefault(x => x.Code == reqVO.desSupplierCode);
            var desCustomerModel = reqVO.desCustomerID.HasValue ?
                this.StaticValue.Customers.FirstOrDefault(x => x.ID == reqVO.desCustomerID) :
                this.StaticValue.Customers.FirstOrDefault(x => x.Code == reqVO.desCustomerCode);

            long? Sou_Customer_ID = reqVO.souCustomerID.HasValue ? reqVO.souCustomerID.Value :
                  string.IsNullOrWhiteSpace(reqVO.souCustomerCode) ? null : this.StaticValue.Customers.First(x => x.Code == reqVO.souCustomerCode).ID;

            long? Sou_Supplier_ID =
                    reqVO.souSupplierID.HasValue ? reqVO.souSupplierID.Value :
                    string.IsNullOrWhiteSpace(reqVO.souSupplierCode) ? null : this.StaticValue.Suppliers.First(x => x.Code == reqVO.souSupplierCode).ID;

            var souAreaMasterModel = this.StaticValue.GetAreaMaster(
                                                    reqVO.souAreaMasterID,
                                                    reqVO.souAreaMasterCode);

            var souWarehouseModel = this.StaticValue.GetWarehouse(
                                                    reqVO.souWarehouseID,
                                                    reqVO.souAreaMasterID,
                                                    reqVO.souWarehouseCode,
                                                    reqVO.souAreaMasterCode);

            var souBranchModel = this.StaticValue.GetBranch(
                                                    reqVO.souBranchID,
                                                    reqVO.souWarehouseID,
                                                    reqVO.souAreaMasterID,
                                                    reqVO.souBranchCode,
                                                    reqVO.souWarehouseCode,
                                                    reqVO.souAreaMasterCode);

            var desAreaMasterModel = this.StaticValue.GetAreaMaster(
                                                    reqVO.desAreaMasterID,
                                                    reqVO.desAreaMasterCode);

            var desWarehouseModel = this.StaticValue.GetWarehouse(
                                                    reqVO.desWarehouseID,
                                                    reqVO.desAreaMasterID,
                                                    reqVO.desWarehouseCode,
                                                    reqVO.desAreaMasterCode);
            var desBranchModel = this.StaticValue.GetBranch(
                                                    reqVO.desBranchID,
                                                    reqVO.desWarehouseID,
                                                    reqVO.desAreaMasterID,
                                                    reqVO.desBranchCode,
                                                    reqVO.desWarehouseCode,
                                                    reqVO.desAreaMasterCode);

            var DocumentProcessTypeCodes = ADO.DataADO.GetInstant().SelectBy<ams_DocumentProcessType>(
           new SQLConditionCriteria[] {
                new SQLConditionCriteria("Code",reqVO.documentProcessTypeCode, SQLOperatorType.EQUALS),
       }, this.BuVO).FirstOrDefault();


            if (DocumentProcessTypeCodes != null)
            {
                var ProceesTypedoc = ADO.DataADO.GetInstant().SelectBy<ams_DocumentProcessMap>(
             new SQLConditionCriteria[] {
                new SQLConditionCriteria("DocumentProcessType_ID",DocumentProcessTypeCodes.ID, SQLOperatorType.EQUALS),
         }, this.BuVO).FirstOrDefault();

                var ProceesTypedocID = ProceesTypedoc.DocumentType_ID.GetValueInt(); 


                if (DocumentProcessTypeCodes != null && ProceesTypedocID == 1011)
                {
                    var DocprocessID = DocumentProcessTypeCodes.ID;
                    var SkuType = DocumentProcessTypeCodes.SKUGroupType.GetValueInt();


                    DocumentProcessTypeID documentProcessTypeID = EnumUtil.GetValueEnum<DocumentProcessTypeID>(DocumentProcessTypeCodes.Code);

                    var OwnerProcess = DocumentProcessTypeCodes.OwnerGroupType.GetValueInt();


                    var skuCode = reqVO.receivedOrderItem.Select(x => x.skuCode).ToArray();

                    var skuLists = ADO.DataADO.GetInstant().SelectBy<ams_SKUMaster>(new SQLConditionCriteria[] {
                   new SQLConditionCriteria("Code",string.Join(',', skuCode), SQLOperatorType.IN),
                      }, this.BuVO);

                    if (skuLists.Any(x => x.SKUMasterType_ID != SkuType))
                    {
                        throw new AMWException(this.Logger, AMWExceptionCode.U0000, "Item not match DocumantProcessType");
                    }

                    if (OwnerProcess == '0')
                    {
                        throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Process Not Found");
                    }
                    else if (OwnerProcess == '1')
                    {
                        if (souWarehouseModel.ID == null)
                        {
                            throw new AMWException(this.Logger, AMWExceptionCode.V1001, "souWarehouse Not Found");
                        }
                        else if (Sou_Supplier_ID != null || Sou_Customer_ID != null)
                        {
                            throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Data Source not correct");
                        }

                    }
                    else if (OwnerProcess == '2')
                    {
                        if (Sou_Customer_ID == null)
                        {
                            throw new AMWException(this.Logger, AMWExceptionCode.V1001, "souCustomer Not Found");
                        }
                        else if (Sou_Supplier_ID != null || souWarehouseModel.ID != null)
                        {
                            throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Data Source not correct");
                        }

                    }
                    else if (OwnerProcess == '3')
                    {
                        if (Sou_Supplier_ID == null)
                        {
                            throw new AMWException(this.Logger, AMWExceptionCode.V1001, "souSupplier Not Found");
                        }
                        else if (Sou_Customer_ID != null || souWarehouseModel.ID != null)
                        {
                            throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Data Source not correct");
                        }

                    }

                    reqVO.documentProcessTypeID = documentProcessTypeID;
                }
            }

            var doc = new CreateDocument().Execute(this.Logger, this.BuVO,
                new CreateDocument.TReq()
                {
                    parentDocumentID = reqVO.parentDocument_ID,
                    lot = reqVO.lot,
                    batch = reqVO.batch,
                    forCustomerID =
                    reqVO.forCustomerID.HasValue ? reqVO.forCustomerID.Value :
                    string.IsNullOrWhiteSpace(reqVO.forCustomerCode) ? null : this.StaticValue.Customers.First(x => x.Code == reqVO.forCustomerCode).ID,

                    souBranchID = souBranchModel == null ? null : souBranchModel.ID,
                    souWarehouseID = souWarehouseModel == null ? null : souWarehouseModel.ID,
                    souCustomerID = Sou_Customer_ID,
                    souSupplierID = Sou_Supplier_ID,
                    souAreaMasterID = souAreaMasterModel == null ? null : souAreaMasterModel.ID,

                    desSupplierID = desSupplierModel == null ? null : desSupplierModel.ID,
                    desCustomerID = desCustomerModel == null ? null : desCustomerModel.ID,


                    desBranchID = desBranchModel == null ? null : desBranchModel.ID,
                    desWarehouseID = desWarehouseModel == null ? null : desWarehouseModel.ID,
                    desAreaMasterID = desAreaMasterModel == null ? null : desAreaMasterModel.ID,
                    documentDate = reqVO.documentDate,
                    actionTime = reqVO.actionTime ?? reqVO.documentDate,

                    refID = reqVO.refID,
                    ref1 = reqVO.ref1,
                    ref2 = reqVO.ref2,
                    ref3 = reqVO.ref3,
                    ref4 = reqVO.ref4,
                    docTypeId = DocumentTypeID.GOODS_RECEIVE,

                    documentProcessTypeID = reqVO.documentProcessTypeID,

                    eventStatus = reqVO.eventStatus,

                    remark = reqVO.remark,




                    Items = reqVO.receivedOrderItem.Select(

                        x => new CreateDocument.TReq.Item

                        {
                            skuCode = x.skuCode,
                            packCode = x.packCode,
                            auditStatus = x.auditStatus,
                            quantity = x.quantity,
                            unitType = x.unitType,
                            cartonNo = x.cartonNo,
                            orderNo = x.orderNo,
                            batch = x.batch,
                            lot = x.lot,
                            options = x.options,
                            expireDate = x.expireDate,
                            productionDate = x.productionDate,
                            shelfLifeDay = x.shelfLifeDay,
                            incubationDay = x.incubationDay,
                            parentDocumentItem_ID = x.parentDocumentItem_ID,
                            ref1 = x.ref1,
                            ref2 = x.ref2,
                            ref3 = x.ref3,
                            ref4 = x.ref4,
                            refID = x.refID,
                            itemNo = x.itemNo,
                            baseQuantity = x.baseQuantity,
                            baseunitType = x.baseunitType,
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
