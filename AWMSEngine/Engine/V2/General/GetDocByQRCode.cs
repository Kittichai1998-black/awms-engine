using AMWUtil.Common;
using AMWUtil.Exception;
using AMSModel.Constant.EnumConst;
using AMSModel.Constant.StringConst;
using AMSModel.Criteria;
using AMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.General
{
    public class GetDocByQRCode : BaseEngine<GetDocByQRCode.TReq, GetDocByQRCode.TRes>
    {

        public class TReq
        {
            public string qr;
        };
        //public class TRes
        //{
        //    public List<DocData> datas;
        //    public class DocData
        //    {
        //        public int docID;
        //        public string docCode;
        //        public int dociID;
        //        public string Batch;
        //        public string Lot;
        //        public decimal Quantity;
        //        public string unitType;
        //        public string SKUItem;
        //    }
        //}
        public class TRes
        {
            public DocumentProcessTypeID processType;
            public long putawayID;
            public string putawayCode;
            public long grID;
            public string grCode;
            public List<PackSto> datas;
           
        }
        public class PackSto
        {
            public string pstoCode;
            public string pstoName;
            public string batch;
            public string lot;
            public string orderNo;
            public string itemNo;
            public string refID;
            public string ref1;
            public string ref2;//SKU1,SKU1|B001,B002|100,500|PC,CAR
            public string ref3;
            public string ref4;
            public string cartonNo;
            public long? forCustomerID;
            public string options;
            public decimal addQty;
            public string unitTypeCode; // old unit 
            public string packUnitTypeCode;
            public AuditStatus? auditStatus;
            public DateTime? expiryDate;
            public DateTime? incubationDate;
            public DateTime? productDate;
        }
        public class QR
        {
            public string numPalelt;
            public string dociID;
            public string qty;
            public string tag;
        };
        protected override TRes ExecuteEngine(TReq reqVO)
        {
            var res = new TRes();
            var packList = new List<PackSto>();
            var StaticValue = ADO.WMSStaticValue.StaticValueManager.GetInstant();
            //res.datas = new List<TRes.DocData>();

            if (reqVO.qr == null || reqVO.qr == "undefined")
                throw new AMWException(this.Logger, AMWExceptionCode.V3001, "QR Code invalid");

            if (reqVO.qr.StartsWith("N|"))
            {
                var qrModel = ObjectUtil.ConvertTextFormatToModel<QR>(reqVO.qr, "N|{numPalelt}|{dociID}|{qty}|{tag}");

                if (qrModel == null)
                    throw new AMWException(this.Logger, AMWExceptionCode.V3001, "QR Code invalid");
                
                List<long> dociID = qrModel.dociID.Split(',').Select(long.Parse).ToList();
                List<long> qty = qrModel.qty.Split(',').Select(long.Parse).ToList();
                List<string> tag = qrModel.tag.Split(',').ToList();

                int i = 0;

                var docitem = ADO.WMSDB.DataADO.GetInstant().SelectByID<amt_DocumentItem>(dociID.FirstOrDefault(), this.BuVO);
                if (docitem == null)
                    throw new AMWException(this.Logger, AMWExceptionCode.V3001, "ไม่พบ DocItem นี้ในระบบ");

                var doc = ADO.WMSDB.DataADO.GetInstant().SelectByID<amt_Document>(docitem.Document_ID, this.BuVO); //PA
                var parentDoc = ADO.WMSDB.DataADO.GetInstant().SelectByID<amt_Document>(doc.ParentDocument_ID, this.BuVO); //GR
                if (parentDoc == null)
                    throw new AMWException(this.Logger, AMWExceptionCode.V3001, "ไม่พบ DocItem นี้ในระบบ");

                res.processType = doc.DocumentProcessType_ID;
                res.grID = parentDoc.ID.Value;
                res.grCode = parentDoc.Code;
                res.putawayID = doc.ID.Value;
                res.putawayCode = doc.Code;

                dociID.ForEach(ID =>
                {
                    //var qtyDistos = ADO.WMSDB.DocumentADO.GetInstant().GetItemAndStoInDocItem(ID, this.BuVO);
                    //var distoQty = qtyDistos.DocItemStos.Sum(x => x.BaseQuantity.Value);
                    var docitemPutaway = ADO.WMSDB.DataADO.GetInstant().SelectByID<amt_DocumentItem>(ID, this.BuVO);
                    var skuPutaway = ADO.WMSDB.DataADO.GetInstant().SelectByID<ams_SKUMaster>(docitemPutaway.SKUMaster_ID, this.BuVO);

                    //if ((qty[i] + distoQty) > docitemPutaway.Quantity)
                    //    throw new AMWException(this.Logger, AMWExceptionCode.V3001, "จำนวนที่กำลังรับเข้ามากว่าจำนวนตั้งรอรับ");

                    //if (qty[i] == 0)
                    //    throw new AMWException(this.Logger, AMWExceptionCode.V3001, "จำนวนรับเข้าเท่ากับ 0");

                    //qrModel.numPalelt
                    var ob = AMWUtil.Common.ObjectUtil.QryStrSetValue(
                        docitemPutaway.Options, new KeyValuePair<string, object>(
                            OptionVOConst.OPT_PALLET_NO, qrModel.numPalelt),
                        new KeyValuePair<string, object>(
                            OptionVOConst.OPT_DOCITEM_ID, qrModel.dociID),
                         new KeyValuePair<string, object>(
                            OptionVOConst.OPT_TAG_NO, tag[i])
                        ); 
                    packList.Add(new PackSto()
                    {
                        pstoCode = skuPutaway.Code,
                        pstoName = skuPutaway.Name,
                        batch = docitemPutaway.Batch,
                        lot = docitemPutaway.Lot,
                        orderNo = docitemPutaway.OrderNo,
                        itemNo = docitemPutaway.ItemNo,
                        refID = docitemPutaway.RefID,
                        ref1 = docitemPutaway.Ref1,
                        ref2 = docitemPutaway.Ref2,
                        ref3 = docitemPutaway.Ref3,
                        ref4 = docitemPutaway.Ref4,
                        cartonNo = docitemPutaway.CartonNo,
                        forCustomerID = doc.For_Customer_ID,
                        //options = AMWUtil.Common.ObjectUtil.QryStrSetValue(docitemPutaway.Options,new KeyValuePair<string, object>(OptionVOConst.OPT_PALLET_NO, qrModel.numPalelt), new KeyValuePair<string, object>(OptionVOConst.OPT_DOCITEM_ID, qrModel.dociID)),
                        options = ob,
                        addQty = qty[i],
                        unitTypeCode = StaticValue.UnitTypes.First(x => x.ID == docitemPutaway.UnitType_ID).Code,
                        packUnitTypeCode = StaticValue.UnitTypes.First(x => x.ID == docitemPutaway.BaseUnitType_ID).Code,
                        expiryDate = docitemPutaway.ExpireDate,
                        productDate = docitemPutaway.ProductionDate,
                        auditStatus = docitemPutaway.AuditStatus
                    });
                    i++;
                });
                res.datas = packList;
            }
            else if (reqVO.qr.StartsWith("E|"))
            {
                //empty pallet 
                res.processType = DocumentProcessTypeID.ESP_TRANSFER_WM;
                var espSKU = StaticValue.LoadSKUMasterEmptyPallets().First();
                packList.Add(new PackSto()
                {
                    pstoCode = espSKU.Code,
                    addQty = 1,
                    unitTypeCode = StaticValue.UnitTypes.First(x => x.ID == espSKU.UnitType_ID).Code,
                    packUnitTypeCode = StaticValue.UnitTypes.First(x => x.ID == espSKU.UnitType_ID).Code,
                });
                res.datas = packList;
            }
            else 
            {
                //config
            }
            if (res == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V3001, "DociID Not Found");

            return res;
        }
    }
}
