using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Criteria.SP.Response;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.Document
{
    public class GetDocumentByID : BaseEngine<GetDocumentByID.TReq, GetDocumentByID.TRes>
    {

        public class TReq
        {
            public int docID;
            public bool getMapSto;
            public DocumentTypeID docTypeID;
        }
        public class TRes
        {
            public ViewDocument document;
            public class ViewDocument : amv_Document
            {
                public List<amv_DocumentItem> documentItems;
            }
            public List<bsto> sou_bstos;
            public List<bsto> des_bstos;

            public class QtyConvert
            {
                public decimal qty;
                public decimal qtyMax;
                public string unit;
            }


        }


        public class bsto
        {
            public long id;
            public StorageObjectType objectType;

            public long mstID;
            public long packID;
            public string packCode;
            public string packName;
            public string skuType;

            public decimal packQty;
            public long packUnitID;
            public string packUnitCode;

            public decimal packBaseQty;
            public long packBaseUnitID;
            public string packBaseUnitCode;

            public int? forCustomerID;
            public DateTime? prodDate;
            public DateTime? expDate;

            public string batch;
            public string lot;
            public string orderNo;

            public EntityStatus status;

            public long docItemID;
            public string code;
            public string name;

            public long rootID;
            public string rootCode;
            public string rootName;

            public decimal distoQty;
            public long distoUnitID;

            public decimal distoBaseQty;
            public string distoUnitCode;
            public decimal distoBaseQtyMax;
            public decimal distoQtyMax;
            public List<TRes.QtyConvert> distoQtyConverts;
            //public decimal distoQtyMaxConvertFirst { get => distoQtyConverts.First().qtyMax; }
            //public decimal distoQtyConvertFirst { get => distoQtyConverts.First().qty; }
            //public string distoUnitConvertFirst { get => distoQtyConverts.First().unit; }


            public long distoBaseUnitID;
            public string distoBaseUnitCode;
            public string distoUnitCodeConvert;


            public int areaID;
            public string areaCode;
            public long workQueueID;
            public string sou_workQueueDesArea;
            public string sou_workQueueDesAreaCode;
            public string sou_workQueueDesAreaName;
            public string des_workQueueDesArea;
            public string des_workQueueDesAreaCode;
            public string des_workQueueDesAreaName;
            public int? areaLocationID;
            public string areaLocationCode;
            public int warehouseID;
            public string warehouseCode;
            public int branchID;
            public string branchCode;
            public string options;
            public DateTime? modifyTimeSTO;
            public DateTime? createTimeSTO;

            public string sou_options;
            public string des_options;
        }

        protected override TRes ExecuteEngine(TReq reqVO)
        {
            TRes res = new TRes();
            List<bsto> sou_sto = new List<bsto>();
            List<bsto> des_sto = new List<bsto>();
            var doc = ADO.DataADO.GetInstant().SelectBy<TRes.ViewDocument>("amv_Document", "*", null,
                new SQLConditionCriteria[]
                {
                    new SQLConditionCriteria("ID", reqVO.docID, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("DocumentType_ID", reqVO.docTypeID, SQLOperatorType.EQUALS)
                },
                new SQLOrderByCriteria[] { }, null, null,
                this.BuVO).FirstOrDefault();
            if (doc == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V2001, "ไม่พบเอกสารในระบบ");
            var docItems = ADO.DataADO.GetInstant().SelectBy<amv_DocumentItem>(
                new SQLConditionCriteria[]
                {
                    new SQLConditionCriteria("Document_ID",doc.ID, SQLOperatorType.EQUALS),
                },
                this.BuVO);

            //foreach (var data in docItems)
            //{
            //    if (data.Code != "000000000" && data.Quantity != null)
            //    {
            //        var result = StaticValue.ConvertToALlUnitBySKU(data.SKUMaster_ID.Value, data.Quantity.Value, data.UnitType_ID.Value);
            //        data.Quantity = result[1].newQty;

            //    }

            //}


            doc.documentItems = AMWUtil.Common.ObjectUtil.JsonCast<List<amv_DocumentItem>>(docItems);
            res.document = doc;

            if (reqVO.getMapSto && doc.documentItems.Count != 0)
            {
                var bstos = ADO.StorageObjectADO.GetInstant().ListBaseInDoc(doc.ID, null, null, this.BuVO);
                bstos.ForEach(bs =>
                {
                    var pack = ADO.DataADO.GetInstant().SelectByID<ams_PackMaster>(bs.sou_packID, this.BuVO);
                    var sku = ADO.DataADO.GetInstant().SelectByID<ams_SKUMaster>(pack.SKUMaster_ID, this.BuVO);

                    //var packCovert = ADO.DataADO.GetInstant().SelectBy<ams_PackMaster>(
                    //    new SQLConditionCriteria[]
                    //    {
                    //        new SQLConditionCriteria("SKUMaster_ID",pack.SKUMaster_ID, SQLOperatorType.EQUALS),
                    //    },
                    //    this.BuVO);

                    //var packBaseConvert = packCovert.Find(x => x.UnitType_ID != x.BaseUnitType_ID);

                    //var x = StaticValue.ConvertToALlUnitBySKU(pack.SKUMaster_ID, bs.distoBaseQty, bs.distoBaseUnitID);
                    //var Listpack = new List<TRes.QtyConvert>();

                    //foreach (var p in x)
                    //{
                    //    var qtyMax = StaticValue.ConvertToNewUnitBySKU(pack.SKUMaster_ID, bs.distoBaseQtyMax, bs.distoBaseUnitID, p.newUnitType_ID);
                    //    Listpack.Add(new TRes.QtyConvert()
                    //    {
                    //        qty = p.newQty,
                    //        qtyMax = qtyMax.newQty,
                    //        unit = StaticValue.UnitTypes.FirstOrDefault(x => x.ID == p.newUnitType_ID).Code

                    //    });
                    //}

                    var docDisto = ADO.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(
                    new SQLConditionCriteria[]
                        {
                            new SQLConditionCriteria("DocumentItem_ID",bs.docItemID, SQLOperatorType.EQUALS),
                        },
                    this.BuVO).FirstOrDefault();

                    var workQueueDesArea = ADO.WorkQueueADO.GetInstant().Get(docDisto.WorkQueue_ID.Value, this.BuVO);


                    sou_sto.Add(new bsto
                    {

                        id = bs.sou_id,
                        objectType = bs.sou_objectType,

                        mstID = bs.sou_mstID,
                        packID = bs.sou_packID,
                        packCode = bs.sou_packCode,
                        packName = bs.sou_packName,
                        skuType = StaticValue.SKUMasterTypes.FirstOrDefault(x => x.ID == sku.SKUMasterType_ID).Code,

                        packQty = bs.sou_packQty,
                        packUnitID = bs.sou_packUnitID,
                        packUnitCode = bs.sou_packUnitCode,

                        packBaseQty = bs.des_packBaseQty,
                        packBaseUnitID = bs.des_packBaseUnitID,
                        packBaseUnitCode = bs.des_packBaseUnitCode,

                        forCustomerID = bs.sou_forCustomerID,
                        prodDate = bs.sou_prodDate,
                        expDate = bs.sou_expDate,

                        batch = bs.sou_batch,
                        lot = bs.sou_lot,
                        orderNo = bs.sou_orderNo,

                        status = bs.sou_status,

                        docItemID = bs.docItemID,
                        code = bs.code,
                        name = bs.name,

                        rootID = bs.rootID,
                        rootCode = bs.rootCode,
                        rootName = bs.rootName,

                        distoQty = bs.distoQty,
                        distoQtyMax = bs.distoQtyMax,
                        distoUnitID = bs.distoUnitID,
                        distoUnitCode = bs.distoUnitCode,
                        //distoQtyConvert = bs.sou_packCode == "000000000" ? bs.distoQty : StaticValue.ConvertToNewUnitByPack(bs.sou_packID, bs.distoQty, pack.BaseUnitType_ID, packBaseConvert.UnitType_ID).newQty,
                        //distoQtyMaxConvert = bs.sou_packCode == "000000000" ? bs.distoQtyMax : StaticValue.ConvertToNewUnitByPack(bs.sou_packID, bs.distoQtyMax, pack.BaseUnitType_ID , packBaseConvert.UnitType_ID).newQty,
                        //distoUnitCodeConvert = bs.sou_packCode == "000000000" ? bs.distoUnitCode : StaticValue.UnitTypes.FirstOrDefault(x => x.ID == packBaseConvert.UnitType_ID).Code,
                        //distoQtyConverts = Listpack,




                        distoBaseQty = bs.distoBaseQty,
                        distoBaseQtyMax = bs.distoBaseQtyMax,
                        distoBaseUnitID = bs.distoBaseUnitID,
                        distoBaseUnitCode = bs.distoBaseUnitCode,

                        workQueueID = docDisto.WorkQueue_ID.Value,
                        sou_workQueueDesArea = workQueueDesArea == null ? null : (StaticValue.AreaMasters.First(x => x.ID == workQueueDesArea.Sou_AreaMaster_ID).Code + " : " + StaticValue.AreaMasters.First(x => x.ID == workQueueDesArea.Sou_AreaMaster_ID).Name),
                        sou_workQueueDesAreaCode = workQueueDesArea == null ? null : StaticValue.AreaMasters.First(x => x.ID == workQueueDesArea.Sou_AreaMaster_ID).Code, //workQueueDesArea.Des_Area_ID,
                        sou_workQueueDesAreaName = workQueueDesArea == null ? null : StaticValue.AreaMasters.First(x => x.ID == workQueueDesArea.Sou_AreaMaster_ID).Name,
                        des_workQueueDesArea = workQueueDesArea == null ? null : (StaticValue.AreaMasters.First(x => x.ID == workQueueDesArea.Des_AreaMaster_ID).Code + " : " + StaticValue.AreaMasters.First(x => x.ID == workQueueDesArea.Des_AreaMaster_ID).Name),
                        des_workQueueDesAreaCode = workQueueDesArea == null ? null : StaticValue.AreaMasters.First(x => x.ID == workQueueDesArea.Des_AreaMaster_ID).Code, //workQueueDesArea.Des_Area_ID,
                        des_workQueueDesAreaName = workQueueDesArea == null ? null : StaticValue.AreaMasters.First(x => x.ID == workQueueDesArea.Des_AreaMaster_ID).Name,

                        areaID = bs.areaID,
                        areaCode = bs.areaCode,
                        areaLocationID = bs.areaLocationID,
                        areaLocationCode = bs.areaLocationCode,
                        warehouseID = bs.warehouseID,
                        warehouseCode = bs.warehouseCode,
                        branchID = bs.branchID,
                        branchCode = bs.branchCode,
                        options = bs.options




                    });

                    des_sto.Add(new bsto
                    {
                        id = bs.des_id,
                        objectType = bs.des_objectType,

                        mstID = bs.des_mstID,
                        packID = bs.des_packID,
                        packCode = bs.des_packCode,
                        packName = bs.des_packName,
                        skuType = StaticValue.SKUMasterTypes.FirstOrDefault(x => x.ID == sku.SKUMasterType_ID).Code,

                        packQty = bs.des_packQty,
                        packUnitID = bs.des_packUnitID,
                        packUnitCode = bs.des_packUnitCode,

                        packBaseQty = bs.des_packBaseQty,
                        packBaseUnitID = bs.des_packBaseUnitID,
                        packBaseUnitCode = bs.des_packBaseUnitCode,

                        forCustomerID = bs.des_forCustomerID,
                        prodDate = bs.des_prodDate,
                        expDate = bs.des_expDate,

                        batch = bs.des_batch,
                        lot = bs.des_lot,
                        orderNo = bs.des_orderNo,

                        status = bs.des_status,

                        docItemID = bs.docItemID,
                        code = bs.code,
                        name = bs.name,

                        rootID = bs.rootID,
                        rootCode = bs.rootCode,
                        rootName = bs.rootName,

                        distoQty = bs.distoQty,
                        distoQtyMax = bs.distoQtyMax,
                        distoUnitID = bs.distoUnitID,
                        distoUnitCode = bs.distoUnitCode,
                        //distoQtyConverts = Listpack,

                        distoBaseQty = bs.distoBaseQty,
                        distoBaseQtyMax = bs.distoBaseQtyMax,
                        distoBaseUnitID = bs.distoBaseUnitID,
                        distoBaseUnitCode = bs.distoBaseUnitCode,

                        workQueueID = docDisto.WorkQueue_ID.Value,
                        sou_workQueueDesArea = workQueueDesArea == null ? null : (StaticValue.AreaMasters.First(x => x.ID == workQueueDesArea.Sou_AreaMaster_ID).Code + " : " + StaticValue.AreaMasters.First(x => x.ID == workQueueDesArea.Sou_AreaMaster_ID).Name),
                        sou_workQueueDesAreaCode = workQueueDesArea == null ? null : StaticValue.AreaMasters.First(x => x.ID == workQueueDesArea.Sou_AreaMaster_ID).Code, //workQueueDesArea.Des_Area_ID,
                        sou_workQueueDesAreaName = workQueueDesArea == null ? null : StaticValue.AreaMasters.First(x => x.ID == workQueueDesArea.Sou_AreaMaster_ID).Name,
                        des_workQueueDesArea = workQueueDesArea == null ? null : (StaticValue.AreaMasters.First(x => x.ID == workQueueDesArea.Des_AreaMaster_ID).Code + " : " + StaticValue.AreaMasters.First(x => x.ID == workQueueDesArea.Des_AreaMaster_ID).Name),
                        des_workQueueDesAreaCode = workQueueDesArea == null ? null : StaticValue.AreaMasters.First(x => x.ID == workQueueDesArea.Des_AreaMaster_ID).Code, //workQueueDesArea.Des_Area_ID,
                        des_workQueueDesAreaName = workQueueDesArea == null ? null : StaticValue.AreaMasters.First(x => x.ID == workQueueDesArea.Des_AreaMaster_ID).Name,

                        areaID = bs.areaID,
                        areaCode = bs.areaCode,
                        areaLocationID = bs.areaLocationID,
                        areaLocationCode = bs.areaLocationCode,
                        warehouseID = bs.warehouseID,
                        warehouseCode = bs.warehouseCode,
                        branchID = bs.branchID,
                        branchCode = bs.branchCode,
                        options = bs.options
                    });

                });
                res.sou_bstos = sou_sto;
                res.des_bstos = des_sto;
            }
            return res;
        }
    }
}
