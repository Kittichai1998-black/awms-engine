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
            public string RefID;
            public int forSupplierID;
            public string batch;
            public string lot;

            public int? souBranchID;//สาขาต้นทาง
            public int? souWarehouseID;//คลังต้นทาง
            public int? souAreaMasterID;//พื้นที่วางสินสินค้าต้นทาง

            public int? desDealerID;//ผู้ผลิตต้นทาง
            public int? desSupplierID;//ผู้จัดจำหน่ายต้นทาง
            public int? desBranchID;//สาขาต้นทาง
            public int? desWarehouseID;//คลังต้นทาง
            public int? desAreaMasterID;//พื้นที่วางสินสินค้าต้นทาง

            public DateTime actionTime;//วันที่ส่ง
            public DateTime DocumentDate;
            public string Remark;

            public bool canPackConvert;
            public List<SKUItem> SKUItems;
            public class SKUItem
            {
                public int skuCode;
                public int qtyPerPack;
                public int amount;
            }
        }

        protected override amt_Document ExecuteEngine(TDocReq reqVO)
        {
            if (reqVO.SKUItems.GroupBy(x => new { skuCode = x.skuCode, qtyPerPack = x.qtyPerPack }).Any(x => x.Count() > 1))
                throw new AMWUtil.Exception.AMWException(this.Logger, AMWExceptionCode.V1002, "SKU Duplicate in List ");
            


            amt_Document newDoc = new amt_Document();
            foreach (var skuItem in reqVO.SKUItems)
            {
                var skuMst = ADO.DataADO.GetInstant().SelectByCode<ams_SKUMaster>(skuItem.skuCode, this.BuVO).FirstOrDefault();
                if (skuMst == null)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1002, "SKU Code : " + skuItem.skuCode);
                var packMst = ADO.DataADO.GetInstant().SelectBy<ams_PackMaster>(
                    new KeyValuePair<string, object>[] {
                        new KeyValuePair<string, object>("SKUMaster_ID",skuMst.ID),
                        new KeyValuePair<string, object>("ItemQty",skuItem.qtyPerPack),
                        new KeyValuePair<string, object>("status",AWMSModel.Constant.EnumConst.EntityStatus.ACTIVE),
                    }, this.BuVO);
                if (packMst == null)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1002, "Pack Qty : " + skuItem.qtyPerPack);

                /* var countDocLock = ADO.DocumentADO.GetInstant().STOCountDocLock(
                                         skuItem.skuID,
                                         skuItem.packID,
                                         reqVO.forSupplierID,
                                         reqVO.batch,
                                         reqVO.lot,
                                         DocumentTypeID.GOODS_ISSUED,
                                         this.BuVO);

                 //Goods Issued from Storage: เบิกโดยใช้หน่วย Pack เท่านั้น
                 if (this.StaticValue.IsFeature(FeatureCode.OB0100))
                 {
                     if(this.StaticValue.IsFeature(FeatureCode.OB0200) && skuItem.quantity > countDocLock.freePackQty)
                         throw new AMWUtil.Exception.AMWException(this.Logger, AMWUtil.Exception.AMWExceptionCode.B0001, "Receive over the amount in the warehouse.");

                 }
                 else
                 {

                 }
                 newDoc.DocumentItems.Add(new amt_DocumentItem()
                 {
                     Code = 
                 });*/
            }


            var res = ADO.DocumentADO.GetInstant().Create(newDoc, this.BuVO);
            return res;
        }

    }
}
