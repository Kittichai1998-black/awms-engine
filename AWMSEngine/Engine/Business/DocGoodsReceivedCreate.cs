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

namespace AWMSEngine.Engine.Business
{
    public class DocGoodsReceivedCreate : BaseEngine<DocGoodsReceivedCreate.TReq, amt_Document>
    {
        public class TReq
        {
            public string refID;
            public string forSupplierCode;
            public string batch;
            public string lot;

            public string souSupplierCode;
            public string souDealerCode;
            public string souBranchCode;//สาขาต้นทาง
            public string souWarehouseCode;//คลังต้นทาง
            public string souAreaMasterCode;//พื้นที่วางสินสินค้าต้นทาง

            public string desBranchCode;//สาขาต้นทาง
            public string desWarehouseCode;//คลังต้นทาง
            public string desAreaMasterCode;//พื้นที่วางสินสินค้าต้นทาง

            public string actionTime;//วันที่ส่ง
            public string documentDate;
            public string remark;
            public string ref1;
            public string ref2;


            public List<SKUItem> skuItems;
            public class SKUItem
            {
                public string skuCode;
                public string packCode;
                public int packItemQty;
                public int quantity;

                public string expireDate;
                public string productionDate;

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
                Barch = reqVO.batch,
                For_Supplier_ID = string.IsNullOrWhiteSpace(reqVO.forSupplierCode) ? null : this.StaticValue.Supplier.First(x => x.Code == reqVO.forSupplierCode).ID,

                Sou_Dealer_ID = string.IsNullOrWhiteSpace(reqVO.souDealerCode) ? null : this.StaticValue.Dealer.First(x => x.Code == reqVO.souDealerCode).ID,
                Sou_Supplier_ID = string.IsNullOrWhiteSpace(reqVO.souSupplierCode) ? null : this.StaticValue.Supplier.First(x => x.Code == reqVO.souSupplierCode).ID,
                Sou_Branch_ID = string.IsNullOrWhiteSpace(reqVO.souBranchCode) ? null : this.StaticValue.Branchs.First(x => x.Code == reqVO.souBranchCode).ID,
                Sou_Warehouse_ID = string.IsNullOrWhiteSpace(reqVO.souWarehouseCode) ? null : this.StaticValue.Warehouses.First(x => x.Code == reqVO.souWarehouseCode).ID,
                Sou_AreaMaster_ID = string.IsNullOrWhiteSpace(reqVO.souAreaMasterCode) ? null : this.StaticValue.AreaMasters.First(x => x.Code == reqVO.souAreaMasterCode).ID,

                Des_Dealer_ID = null,
                Des_Supplier_ID = null,
                Des_Branch_ID = string.IsNullOrWhiteSpace(reqVO.desBranchCode) ? null : this.StaticValue.Branchs.First(x => x.Code == reqVO.desBranchCode).ID,
                Des_Warehouse_ID = string.IsNullOrWhiteSpace(reqVO.desWarehouseCode) ? null : this.StaticValue.Warehouses.First(x => x.Code == reqVO.desWarehouseCode).ID,
                Des_AreaMaster_ID = string.IsNullOrWhiteSpace(reqVO.desAreaMasterCode) ? null : this.StaticValue.AreaMasters.First(x => x.Code == reqVO.desAreaMasterCode).ID,
                DocumentDate = reqVO.documentDate.GetDate().Value,
                ActionTime = reqVO.actionTime.GetDateTime().Value,

                RefID = reqVO.refID,
                Ref1 = reqVO.ref1,
                Ref2 = reqVO.ref2,

                DocumentType_ID = DocumentTypeID.GOODS_RECEIVED,
                EventStatus = DocumentEventStatus.ONPROGRESS,

                Remark = reqVO.remark,
                Options = null,
                TransportNo = null,

                DocumentItems = new List<amt_DocumentItem>(),

            };

            foreach (var skuItem in reqVO.skuItems)
            {
                var skuMst = ADO.DataADO.GetInstant().SelectByCodeActive<ams_SKUMaster>(skuItem.skuCode, this.BuVO);
                var packMst = string.IsNullOrWhiteSpace(skuItem.packCode) ?
                    ADO.MasterADO.GetInstant().GetPackMaster(skuMst.ID.Value, skuItem.packItemQty, this.BuVO) :
                    ADO.DataADO.GetInstant().SelectByCodeActive<ams_PackMaster>(skuItem.packCode, this.BuVO);

                doc.DocumentItems.Add(new amt_DocumentItem()
                {
                    ID = null,
                    Code = skuMst.Code,
                    SKU_ID = skuMst.ID.Value,
                    PackMaster_ID = packMst.ID.Value,
                    Quantity = skuItem.quantity,
                    
                    EventStatus = DocumentEventStatus.ONPROGRESS,

                    Options = AMWUtil.Common.ObjectUtil.ListKeyToQueryString(skuItem.options),
                    ExpireDate = DateTimeUtil.GetDate(skuItem.expireDate),
                    ProductionDate = DateTimeUtil.GetDate(skuItem.productionDate),
                    Ref1 = skuItem.ref1,
                    Ref2 = skuItem.ref2,
                    Ref3 = skuItem.ref3,
                    StorageObjectIDs = new List<long>()
                });
            }


            doc = ADO.DocumentADO.GetInstant().Create(doc, BuVO);
            
            return doc;
        }

        private List<StorageObjectCriteria> GetPackForNewDoc(StorageObjectCriteria mapsto, List<StorageObjectCriteria> outMapstos = null)
        {
            if (outMapstos == null)
                outMapstos = new List<StorageObjectCriteria>();
            if (mapsto._onchange && mapsto.type == StorageObjectType.PACK)
            {
                outMapstos.Add(mapsto);
            }
            mapsto.mapstos.ForEach(x => GetPackForNewDoc(x, outMapstos));
            return outMapstos;
        }
    }
}
