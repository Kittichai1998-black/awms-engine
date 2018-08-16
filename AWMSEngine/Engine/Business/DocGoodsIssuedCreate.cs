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
            public string forSupplierCode;
            public string batch;
            public string lot;

            public string souBranchCode;//สาขาต้นทาง
            public string souWarehouseCode;//คลังต้นทาง
            public string souAreaMasterCode;//พื้นที่วางสินสินค้าต้นทาง

            public string desDealerCode;//ผู้ผลิตต้นทาง
            public string desSupplierCode;//ผู้จัดจำหน่ายต้นทาง

            public string actionTime;//วันที่ส่ง
            public string documentDate;
            public string remark;


            public List<SKUItem> skuItems;
            public class SKUItem
            {
                public int skuCode;
                public int unitQtyPerPack;
                public int packQty;
            }
        }

        protected override amt_Document ExecuteEngine(TDocReq reqVO)
        {
            if (reqVO.skuItems.GroupBy(x => new { skuCode = x.skuCode, qtyPerPack = x.unitQtyPerPack }).Any(x => x.Count() > 1))
                throw new AMWUtil.Exception.AMWException(this.Logger, AMWExceptionCode.V1002, "SKU Duplicate in List ");



            amt_Document newDoc = new amt_Document()
            {
                Lot = reqVO.lot,
                Barch = reqVO.batch,
                For_Supplier_ID = string.IsNullOrWhiteSpace(reqVO.forSupplierCode) ? null : this.StaticValue.Supplier.First(x => x.Code == reqVO.forSupplierCode).ID,
                RefID = reqVO.refID,

                Sou_Warehouse_ID = string.IsNullOrWhiteSpace(reqVO.souWarehouseCode) ? null : this.StaticValue.Warehouses.First(x => x.Code == reqVO.souWarehouseCode).ID,
                Sou_Branch_ID = string.IsNullOrWhiteSpace(reqVO.souBranchCode) ? null : this.StaticValue.Branchs.First(x => x.Code == reqVO.souBranchCode).ID,
                Sou_AreaMaster_ID = string.IsNullOrWhiteSpace(reqVO.souAreaMasterCode) ? null : this.StaticValue.AreaMasters.First(x => x.Code == reqVO.souAreaMasterCode).ID,

                Des_Supplier_ID = string.IsNullOrWhiteSpace(reqVO.desSupplierCode) ? null : this.StaticValue.Supplier.First(x => x.Code == reqVO.desSupplierCode).ID,
                Des_Dealer_ID = string.IsNullOrWhiteSpace(reqVO.desDealerCode) ? null : this.StaticValue.Dealer.First(x => x.Code == reqVO.desDealerCode).ID,

                ActionTime = DateTimeUtil.GetDateTime( reqVO.actionTime),
                DocumentDate = reqVO.documentDate.GetDate().Value,
                Remark = reqVO.remark,

                DocumentItems = new List<amt_DocumentItem>()
            };
            foreach (var skuItem in reqVO.skuItems)
            {
                var skuMst = ADO.DataADO.GetInstant().SelectByCodeActive<ams_SKUMaster>(skuItem.skuCode, this.BuVO);
                if (skuMst == null)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1002, "SKU Code = " + skuItem.skuCode);

                long? packID = null;
                ams_PackMaster packMst = null;
                //Goods Issued from Storage: เบิกโดยใช้ SKU ที่ Pack ต่างกันได้
                if (this.StaticValue.IsFeature(FeatureCode.OB0100))
                {
                    packMst = ADO.DataADO.GetInstant().SelectBy<ams_PackMaster>(
                        new KeyValuePair<string, object>[] {
                        new KeyValuePair<string, object>("SKUMaster_ID",skuMst.ID),
                        new KeyValuePair<string, object>("ItemQty",skuItem.unitQtyPerPack),
                        new KeyValuePair<string, object>("status",AWMSModel.Constant.EnumConst.EntityStatus.ACTIVE),
                        }, this.BuVO).FirstOrDefault();

                    if (packMst == null)
                        throw new AMWException(this.Logger, AMWExceptionCode.V1002, "ไม่พบ Pack ที่มีจำนวน QTY = " + skuItem.unitQtyPerPack + " ในระบบ");

                    packID = packMst.ID;
                }

                var countDocLock = ADO.DocumentADO.GetInstant().STOCountDocLock(
                                         skuMst.ID.Value,
                                         packID,
                                         newDoc.For_Supplier_ID,
                                         reqVO.batch,
                                         reqVO.lot,
                                         DocumentTypeID.GOODS_ISSUED,
                                         this.BuVO);

                string code;
                if (packMst != null)
                {
                    if (this.StaticValue.IsFeature(FeatureCode.OB0200) && skuItem.packQty > countDocLock.freePackQty)
                        throw new AMWUtil.Exception.AMWException(this.Logger, AMWUtil.Exception.AMWExceptionCode.B0001, "Receive over the amount in the warehouse.");
                    code = packMst.Code;
                }
                else
                {
                    if (this.StaticValue.IsFeature(FeatureCode.OB0200) && skuItem.packQty * skuItem.unitQtyPerPack > countDocLock.freeUnitQty)
                        throw new AMWUtil.Exception.AMWException(this.Logger, AMWUtil.Exception.AMWExceptionCode.B0001, "Receive over the amount in the warehouse.");
                    code = skuMst.Code;

                }


                newDoc.DocumentItems.Add(new amt_DocumentItem()
                {
                    Code = code,
                    SKU_ID = skuMst.ID.Value,
                    Quantity = skuItem.packQty,
                    PackMaster_ID = packID,
                    EventStatus = DocumentEventStatus.NEW                    
                });
            }


            var res = ADO.DocumentADO.GetInstant().Create(newDoc, this.BuVO);
            return res;
        }

    }
}
