using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.ADO;
using AWMSEngine.ADO.StaticValue;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business.Received
{
    public class CreateGRDocument : BaseEngine<CreateGRDocument.TReq, amt_Document>
    {
        public class TReq
        {
            public string refID;
            public string forCustomerCode;
            public string batch;
            public string lot;

            public string souSupplierCode;
            public string souCustomerCode;
            public string souBranchCode;//สาขาต้นทาง
            public string souWarehouseCode;//คลังต้นทาง
            public string souAreaMasterCode;//พื้นที่วางสินสินค้าต้นทาง

            public string desBranchCode;//สาขาต้นทาง
            public string desWarehouseCode;//คลังต้นทาง
            public string desAreaMasterCode;//พื้นที่วางสินสินค้าต้นทาง

            public DateTime? actionTime;//วันที่ส่ง
            public DateTime documentDate;
            public string remark;
            public string ref1;
            public string ref2;


            public List<ReceiveItem> receiveItems;
            public class ReceiveItem
            {
                public string skuCode;
                public string packCode;
                public int? packItemQty;
                public int quantity;

                public DateTime? expireDate;
                public DateTime? productionDate;

                public string ref1;
                public string ref2;
                public string ref3;
                public KeyValuePair<string, object>[] options;
            }
        }
        protected override amt_Document ExecuteEngine(TReq reqVO)
        {
            amt_Document doc = new amt_Document()
            {
                ID = null,
                Code = null,
                ParentDocument_ID = null,

                Lot = reqVO.lot,
                Batch = reqVO.batch,
                For_Customer_ID = string.IsNullOrWhiteSpace(reqVO.forCustomerCode) ? null : this.StaticValue.Customers.First(x => x.Code == reqVO.forCustomerCode).ID,

                Sou_Customer_ID = string.IsNullOrWhiteSpace(reqVO.souCustomerCode) ? null : this.StaticValue.Customers.First(x => x.Code == reqVO.souCustomerCode).ID,
                Sou_Supplier_ID = string.IsNullOrWhiteSpace(reqVO.souSupplierCode) ? null : this.StaticValue.Suppliers.First(x => x.Code == reqVO.souSupplierCode).ID,
                Sou_Branch_ID = string.IsNullOrWhiteSpace(reqVO.souBranchCode) ? null : this.StaticValue.Branchs.First(x => x.Code == reqVO.souBranchCode).ID,
                Sou_Warehouse_ID = string.IsNullOrWhiteSpace(reqVO.souWarehouseCode) ? null : this.StaticValue.Warehouses.First(x => x.Code == reqVO.souWarehouseCode).ID,
                Sou_AreaMaster_ID = string.IsNullOrWhiteSpace(reqVO.souAreaMasterCode) ? null : this.StaticValue.AreaMasters.First(x => x.Code == reqVO.souAreaMasterCode).ID,

                Des_Customer_ID = null,
                Des_Supplier_ID = null,
                Des_Branch_ID = string.IsNullOrWhiteSpace(reqVO.desBranchCode) ? null : this.StaticValue.Branchs.First(x => x.Code == reqVO.desBranchCode).ID,
                Des_Warehouse_ID = string.IsNullOrWhiteSpace(reqVO.desWarehouseCode) ? null : this.StaticValue.Warehouses.First(x => x.Code == reqVO.desWarehouseCode).ID,
                Des_AreaMaster_ID = string.IsNullOrWhiteSpace(reqVO.desAreaMasterCode) ? null : this.StaticValue.AreaMasters.First(x => x.Code == reqVO.desAreaMasterCode).ID,
                DocumentDate = reqVO.documentDate,
                ActionTime = reqVO.actionTime,

                RefID = reqVO.refID,
                Ref1 = reqVO.ref1,
                Ref2 = reqVO.ref2,

                DocumentType_ID = DocumentTypeID.GOODS_RECEIVED,
                EventStatus = DocumentEventStatus.WORKING,

                Remark = reqVO.remark,
                Options = null,
                Transport_ID = null,

                DocumentItems = new List<amt_DocumentItem>(),

            };

            foreach (var recItem in reqVO.receiveItems)
            {
                ams_PackMaster packMst = null;
                ams_SKUMaster skuMst = null;

                if (!string.IsNullOrWhiteSpace(recItem.packCode)) {
                    packMst = ADO.DataADO.GetInstant().SelectByCodeActive<ams_PackMaster>(recItem.packCode, this.BuVO);
                    skuMst = ADO.DataADO.GetInstant().SelectByID<ams_SKUMaster>(packMst.SKUMaster_ID, this.BuVO);
                }
                else if(!string.IsNullOrWhiteSpace(recItem.skuCode) && recItem.packItemQty.HasValue)
                {
                    skuMst = ADO.DataADO.GetInstant().SelectByCodeActive<ams_SKUMaster>(recItem.skuCode, this.BuVO);
                    if (skuMst == null)
                        throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบรหัส SKU '" + recItem.skuCode + "'");
                    packMst = ADO.MasterADO.GetInstant().GetPackMaster(skuMst.ID.Value, recItem.packItemQty.Value, this.BuVO);
                    if (packMst == null)
                        throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบข้อมูลแพ็คของ SKU '" + recItem.skuCode + "' ที่มีจำนวน '"+ recItem.packItemQty + " ชิ้น/แพ็ค");
                }
                else
                {
                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "กรุณาส่ง packCode หรือ skuCode,packItemQty");
                }

                doc.DocumentItems.Add(new amt_DocumentItem()
                {
                    ID = null,
                    Code = skuMst.Code,
                    SKUMaster_ID = skuMst.ID.Value,
                    PackMaster_ID = packMst.ID.Value,
                    Quantity = recItem.quantity,
                    
                    EventStatus = DocumentEventStatus.WORKING,

                    Options = AMWUtil.Common.ObjectUtil.ListKeyToQueryString(recItem.options),
                    ExpireDate = recItem.expireDate,
                    ProductionDate = recItem.productionDate,
                    Ref1 = recItem.ref1,
                    Ref2 = recItem.ref2,
                    Ref3 = recItem.ref3,
                    StorageObjectIDs = new List<long>()
                });
            }


            doc = ADO.DocumentADO.GetInstant().Create(doc, BuVO);
            
            return doc;
        }
        
    }
}
