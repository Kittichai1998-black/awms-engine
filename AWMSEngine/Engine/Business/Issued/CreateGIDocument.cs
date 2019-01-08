using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business.Issued
{
    public class CreateDocument : BaseEngine<CreateDocument.TReq, amt_Document>
    {

        public class TReq
        {
            public string refID;
            public string ref1;
            public string ref2;
            public int? forCustomerID;
            public string forCustomerCode;
            public string batch;
            public string lot;

            public int? souBranchID;
            public int? souWarehouseID;
            public int? souAreaMasterID;
            public string souBranchCode;//สาขาต้นทาง
            public string souWarehouseCode;//คลังต้นทาง
            public string souAreaMasterCode;//พื้นที่วางสินสินค้าต้นทาง
            public int? transportID;

            public int? desCustomerID;
            public int? desSupplierID;
            public int? desBranchID;
            public int? desWarehouseID;
            public int? desAreaMasterID;
            public string desCustomerCode;//ผู้ผลิตต้นทาง
            public string desSupplierCode;//ผู้จัดจำหน่ายต้นทาง
            public string desBranchCode;
            public string desWarehouseCode;
            public string desAreaMasterCode;

            public DateTime? actionTime;//วันที่ส่ง
            public DateTime documentDate;
            public string remark;
            public string options;

            public DocumentEventStatus eventStatus = DocumentEventStatus.IDEL;

            public List<IssueItem> issueItems;
            public class IssueItem
            {

                public string packCode;
                public long? packID;
                public string skuCode;
                public decimal? quantity;
                public string unitType;

                public string batch;
                public string lot;
                public string orderNo;
                public string refID;
                public string ref1;
                public string ref2;
                public string options;

                public DateTime? expireDate;
                public DateTime? productionDate;
                
                public DocumentEventStatus eventStatus = DocumentEventStatus.IDEL;

                public List<amt_DocumentItemStorageObject> docItemStos;
            }
        }

        protected override amt_Document ExecuteEngine(TReq reqVO)
        {
            var forCustomerModel = reqVO.forCustomerID.HasValue ?
                 this.StaticValue.Customers.FirstOrDefault(x => x.ID == reqVO.forCustomerID) :
                 this.StaticValue.Customers.FirstOrDefault(x => x.Code == reqVO.forCustomerCode);
            var desSupplierModel = reqVO.desSupplierID.HasValue ?
                this.StaticValue.AreaMasters.FirstOrDefault(x => x.ID == reqVO.desSupplierID) :
                this.StaticValue.AreaMasters.FirstOrDefault(x => x.Code == reqVO.desSupplierCode);
            var desCustomerModel = reqVO.desCustomerID.HasValue ?
                this.StaticValue.Customers.FirstOrDefault(x => x.ID == reqVO.desCustomerID) :
                this.StaticValue.Customers.FirstOrDefault(x => x.Code == reqVO.desCustomerCode);

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

            amt_Document doc = new amt_Document()
            {
                RefID = reqVO.refID,
                Ref1 = reqVO.ref1,
                Ref2 = reqVO.ref2,
                Lot = reqVO.lot,
                Batch = reqVO.batch,
                For_Customer_ID = forCustomerModel == null ? null : forCustomerModel.ID,

                Sou_Warehouse_ID = souWarehouseModel == null ? null : souWarehouseModel.ID,
                Sou_Branch_ID = souBranchModel == null ? null : souBranchModel.ID,
                Sou_AreaMaster_ID = souAreaMasterModel == null ? null : souAreaMasterModel.ID,

                Des_Supplier_ID = desSupplierModel == null ? null : desSupplierModel.ID,
                Des_Customer_ID = desCustomerModel == null ? null : desCustomerModel.ID,

                Des_Warehouse_ID = desWarehouseModel == null ? null : desWarehouseModel.ID,
                Des_Branch_ID = desBranchModel == null ? null : desBranchModel.ID,
                Des_AreaMaster_ID = desAreaMasterModel == null ? null : desAreaMasterModel.ID,

                Transport_ID = reqVO.transportID,

                ActionTime = reqVO.actionTime,
                DocumentDate = reqVO.documentDate,
                DocumentType_ID = DocumentTypeID.GOODS_ISSUED,

                Remark = reqVO.remark,
                Options = reqVO.options,

                EventStatus = reqVO.eventStatus,

                DocumentItems = new List<amt_DocumentItem>()
            };

            foreach (var recItem in reqVO.issueItems)
            {
                
                ams_PackMaster packMst = null;
                ams_SKUMaster skuMst = null;

                if (recItem.packID.HasValue)
                {
                    packMst = ADO.DataADO.GetInstant().SelectByID<ams_PackMaster>(recItem.packID, this.BuVO);
                    if (packMst == null)
                        throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบ Pack:" + recItem.packCode + " / Unit:" + recItem.unitType + " ในระบบ");
                    skuMst = ADO.DataADO.GetInstant().SelectByID<ams_SKUMaster>(packMst.SKUMaster_ID, this.BuVO);
                    if (skuMst == null)
                        throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบ Pack:" + recItem.packCode + " ในระบบ");
                }
                else if (!string.IsNullOrWhiteSpace(recItem.packCode))
                {
                    packMst = ADO.MasterADO.GetInstant().GetPackMasterByPack(recItem.packCode, recItem.unitType, this.BuVO);
                    if (packMst == null)
                        throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบ Pack:" + recItem.packCode + " / Unit:" + recItem.unitType + " ในระบบ");
                    skuMst = ADO.DataADO.GetInstant().SelectByID<ams_SKUMaster>(packMst.SKUMaster_ID, this.BuVO);
                    if (skuMst == null)
                        throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบ Pack:" + recItem.packCode + " ในระบบ");
                }
                else if (!string.IsNullOrWhiteSpace(recItem.skuCode))
                {
                    skuMst = ADO.DataADO.GetInstant().SelectByCodeActive<ams_SKUMaster>(recItem.skuCode, this.BuVO);
                    if(skuMst == null)
                        throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบ SKU:" + recItem.skuCode + " ในระบบ");
                    packMst = ADO.MasterADO.GetInstant().GetPackMasterBySKU(skuMst.ID.Value, recItem.unitType, this.BuVO);
                    if (packMst == null)
                        throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบ SKU:" + recItem.skuCode + " / Unit:" + recItem.unitType + " ในระบบ");
                }
                else
                {
                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "กรุณาส่ง packCode หรือ skuCode,packItemQty");
                }

                //var mainUnitType = this.StaticValue.UnitTypes.First(x => x.Code == recItem.packItemUnit);
                var baseUnitTypeConvt = this.StaticValue.ConvertToBaseUnitByPack(packMst.ID.Value, recItem.quantity ?? 1, packMst.UnitType_ID);
                decimal? baseQuantity = null;
                if (recItem.quantity.HasValue)
                    baseQuantity = baseUnitTypeConvt.baseQty;
                doc.DocumentItems.Add(new amt_DocumentItem()
                {
                    ID = null,
                    Code = skuMst.Code,
                    SKUMaster_ID = skuMst.ID.Value,
                    PackMaster_ID = packMst.ID.Value,

                    Quantity = recItem.quantity,
                    UnitType_ID = baseUnitTypeConvt.unitType_ID,
                    BaseQuantity = baseQuantity,
                    BaseUnitType_ID = baseUnitTypeConvt.baseUnitType_ID,

                    OrderNo = recItem.orderNo,
                    Batch = recItem.batch,
                    Lot = recItem.lot,

                    Options = recItem.options,
                    ExpireDate = recItem.expireDate,
                    ProductionDate = recItem.productionDate,

                    Ref1 = recItem.ref1,
                    Ref2 = recItem.ref2,
                    RefID = recItem.refID,

                    EventStatus = recItem.eventStatus,
                    DocItemStos = recItem.docItemStos
                });
            }


            doc = ADO.DocumentADO.GetInstant().Create(doc, BuVO);

            return doc;
        }
    }
}
