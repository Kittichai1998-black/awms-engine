using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business
{
    public class DocGoodsIssuedCreate : BaseEngine<DocGoodsIssuedCreate.TDocReq, amt_Document>
    {

        public class TDocReq
        {
            public string refID;
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

            public int? desCustomerID;
            public int? desSupplierID;
            public string desCustomerCode;//ผู้ผลิตต้นทาง
            public string desSupplierCode;//ผู้จัดจำหน่ายต้นทาง

            public DateTime? actionTime;//วันที่ส่ง
            public DateTime documentDate;
            public string remark;

            public List<IssueItem> issueItems;
            public class IssueItem
            {
                public int? packID;
                public string skuCode;
                //public PickingType pickingType;
                //public string baseTypeCode;
                public string packTypeCode;
                public int packQty;
            }
        }

        protected override amt_Document ExecuteEngine(TDocReq reqVO)
        {
            if (reqVO.issueItems.GroupBy(x => new { a = x.skuCode, b = x.packTypeCode, c = x.packQty }).Any(x => x.Count() > 1))
                throw new AMWUtil.Exception.AMWException(this.Logger, AMWExceptionCode.V1002, "SKU Duplicate in List ");

            var newDoc = this.NewDocument(reqVO);
            newDoc.DocumentItems = this.NewDocumentItem(reqVO, newDoc);
            var res = ADO.DocumentADO.GetInstant().Create(newDoc, this.BuVO);

            return res;
        }

        private amt_Document NewDocument(TDocReq reqVO)
        {
            var forCustomerModel = reqVO.forCustomerID.HasValue ?
                 this.StaticValue.Customers.FirstOrDefault(x => x.ID == reqVO.forCustomerID) :
                 this.StaticValue.Customers.FirstOrDefault(x => x.Code == reqVO.forCustomerCode);
            var souWarehouseModel = reqVO.souWarehouseID.HasValue ?
                this.StaticValue.Warehouses.FirstOrDefault(x => x.ID == reqVO.souWarehouseID) :
                this.StaticValue.Warehouses.FirstOrDefault(x => x.Code == reqVO.souWarehouseCode);
            var souBranchModel = reqVO.souBranchID.HasValue?
                this.StaticValue.Branchs.FirstOrDefault(x => x.ID == reqVO.souBranchID) : 
                this.StaticValue.Branchs.FirstOrDefault(x => x.Code == reqVO.souBranchCode);
            var souAreaMasterModel = reqVO.souAreaMasterID.HasValue?
                this.StaticValue.AreaMasters.FirstOrDefault(x => x.ID == reqVO.souAreaMasterID):
                this.StaticValue.AreaMasters.FirstOrDefault(x => x.Code == reqVO.souAreaMasterCode);
            var desSupplierModel = reqVO.desSupplierID.HasValue?
                this.StaticValue.AreaMasters.FirstOrDefault(x => x.ID == reqVO.desSupplierID):
                this.StaticValue.AreaMasters.FirstOrDefault(x => x.Code == reqVO.desSupplierCode);
            var desCustomerModel = reqVO.desCustomerID.HasValue?
                this.StaticValue.Customers.FirstOrDefault(x => x.ID == reqVO.desCustomerID):
                this.StaticValue.Customers.FirstOrDefault(x => x.Code == reqVO.desCustomerCode);

            if (forCustomerModel == null && !string.IsNullOrWhiteSpace(reqVO.forCustomerCode))
                throw new AMWException(this.Logger, AMWExceptionCode.V1002, "forCustomerCode ไม่ถูกต้อง");
            else if (forCustomerModel == null && reqVO.forCustomerID.HasValue)
                throw new AMWException(this.Logger, AMWExceptionCode.V1002, "forCustomerID ไม่ถูกต้อง");

            if (souWarehouseModel == null && !string.IsNullOrWhiteSpace(reqVO.souWarehouseCode))
                throw new AMWException(this.Logger, AMWExceptionCode.V1002, "souWarehouseCode ไม่ถูกต้อง");
            else if (souWarehouseModel == null && reqVO.souWarehouseID.HasValue)
                throw new AMWException(this.Logger, AMWExceptionCode.V1002, "souWarehouseID ไม่ถูกต้อง");

            if (souBranchModel == null && !string.IsNullOrWhiteSpace(reqVO.souBranchCode))
                throw new AMWException(this.Logger, AMWExceptionCode.V1002, "souBranchCode ไม่ถูกต้อง");
            else if (souBranchModel == null && reqVO.souBranchID.HasValue)
                throw new AMWException(this.Logger, AMWExceptionCode.V1002, "souBranchID ไม่ถูกต้อง");

            if (souAreaMasterModel == null && !string.IsNullOrWhiteSpace(reqVO.souAreaMasterCode))
                throw new AMWException(this.Logger, AMWExceptionCode.V1002, "souAreaMasterCode ไม่ถูกต้อง");
            else if (souAreaMasterModel == null && reqVO.souAreaMasterID.HasValue)
                throw new AMWException(this.Logger, AMWExceptionCode.V1002, "souAreaMasterID ไม่ถูกต้อง");

            if (desSupplierModel == null && !string.IsNullOrWhiteSpace(reqVO.desSupplierCode))
                throw new AMWException(this.Logger, AMWExceptionCode.V1002, "desSupplierCode ไม่ถูกต้อง");
            else if (desSupplierModel == null && reqVO.desSupplierID.HasValue)
                throw new AMWException(this.Logger, AMWExceptionCode.V1002, "desSupplierID ไม่ถูกต้อง");

            if (desCustomerModel == null && !string.IsNullOrWhiteSpace(reqVO.desCustomerCode))
                throw new AMWException(this.Logger, AMWExceptionCode.V1002, "desCustomerCode ไม่ถูกต้อง");
            else if (desCustomerModel == null && reqVO.desCustomerID.HasValue)
                throw new AMWException(this.Logger, AMWExceptionCode.V1002, "desCustomerID ไม่ถูกต้อง");
            else if (desCustomerModel == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1002, "กรุณาส่ง desCustomerCode");

            amt_Document newDoc = new amt_Document()
            {
                RefID = reqVO.refID,
                Lot = reqVO.lot,
                Barch = reqVO.batch,
                For_Customer_ID = forCustomerModel == null ? null : forCustomerModel.ID,

                Sou_Warehouse_ID = souWarehouseModel == null ? null : souWarehouseModel.ID,
                Sou_Branch_ID = souBranchModel == null ? null : souBranchModel.ID,
                Sou_AreaMaster_ID = souAreaMasterModel == null ? null : souAreaMasterModel.ID,

                Des_Supplier_ID = desSupplierModel == null ? null : desSupplierModel.ID,
                Des_Customer_ID = desCustomerModel == null ? null : desCustomerModel.ID,

                ActionTime = reqVO.actionTime,
                DocumentDate = reqVO.documentDate,
                DocumentType_ID = DocumentTypeID.GOODS_ISSUED,

                Remark = reqVO.remark,

                EventStatus = DocumentEventStatus.WORKING,

                DocumentItems = new List<amt_DocumentItem>()
            };
            return newDoc;
        }

        private List<amt_DocumentItem> NewDocumentItem(TDocReq reqVO ,amt_Document newDoc)
        {
            List<amt_DocumentItem> newDocItems = new List<amt_DocumentItem>();
            //สร้าง Item Document สำหรับเบิก
            foreach (var issueItem in reqVO.issueItems)
            {
                ams_SKUMaster skuMst = null;
                ams_PackMaster packMst = null;
                if (issueItem.packID.HasValue)
                {
                    packMst = ADO.DataADO.GetInstant().SelectByID<ams_PackMaster>(issueItem.packID,this.BuVO);
                    if (packMst == null)
                        throw new AMWException(this.Logger, AMWExceptionCode.V1001, "PackMaster_ID " + issueItem.packID + " ไม่ถูกต้อง");
                    skuMst = ADO.DataADO.GetInstant().SelectByID<ams_SKUMaster>(packMst.SKUMaster_ID, this.BuVO);
                }
                else
                {
                    skuMst = ADO.DataADO.GetInstant().SelectByCodeActive<ams_SKUMaster>(issueItem.skuCode, this.BuVO);
                    if (skuMst == null)
                        throw new AMWException(this.Logger, AMWExceptionCode.V1001, "SKU Code " + issueItem.skuCode);
                    var packMstType = this.StaticValue.PackMasterType.FirstOrDefault(x => x.Code == issueItem.packTypeCode);
                    if (packMstType == null)
                        throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Pack Type Code " + issueItem.skuCode);

                    packMst = ADO.DataADO.GetInstant().SelectBy<ams_PackMaster>(
                            new KeyValuePair<string, object>[] {
                            new KeyValuePair<string, object>("SKUMaster_ID",skuMst.ID),
                            new KeyValuePair<string, object>("PackMasterType_ID",packMstType.ID),
                            new KeyValuePair<string, object>("status",AWMSModel.Constant.EnumConst.EntityStatus.ACTIVE),
                            }, this.BuVO).FirstOrDefault();
                    if (packMst == null)
                        throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Pack ประเภท " + packMstType.Code + " ของสินค้า " + skuMst.Code);
                }






                if (!this.StaticValue.IsFeature(FeatureCode.OB0200)) {

                    var countDocLock = ADO.DocumentADO.GetInstant().STOCountDocLock(
                                             skuMst.ID.Value,
                                             packMst.ID.Value,
                                             newDoc.Sou_Warehouse_ID,
                                             newDoc.For_Customer_ID,
                                             reqVO.batch,
                                             reqVO.lot,
                                             new DocumentTypeID[] { DocumentTypeID.GOODS_ISSUED },
                                             this.BuVO);
                    if (issueItem.packQty > countDocLock.freePackQty)
                        throw new AMWUtil.Exception.AMWException(this.Logger, AMWUtil.Exception.AMWExceptionCode.B0001, "Receive over the amount in the warehouse.");
                }

                var newDocItem = new amt_DocumentItem()
                {
                    Code = packMst.Code,
                    SKUMaster_ID = skuMst.ID.Value,
                    PackMaster_ID = packMst.ID.Value,
                    Quantity = issueItem.packQty,
                    EventStatus = DocumentEventStatus.WORKING
                };
                newDocItems.Add(newDocItem);

            }

            return newDocItems;
        }
    }
}
