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
            public string itemNo;

            public EntityStatus status;

            public long docItemID;
            public string code;
            public string name;

            public long rootID;
            public string rootCode;
            public string rootName;
            public long distoID;
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
            public string docSouCode;
            public long docSouID;
            public int areaID;
            public int areaTypeID;
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
            public string diItemNo;
            public AuditStatus diAuditStatus;
            public string diLot;
            public string diCartonNo;
            public string diBatch;
            public int? diIncubationDay;
            public int? diShelfLifeDay;
            public string diOrderNo;
            public string diRef1;
            public string diRef2;
            public string diRef3;
            public string diRef4;
            public DateTime? diExpireDate;
            public DateTime? diProductionDate;
            public string dcCode;
            public long  dcDocType_ID;
            public long dcID;

            public string sou_options;
            public string des_options;
        }

        protected override TRes ExecuteEngine(TReq reqVO)
        {
            //var qtypC = StaticValue.ConvertToNewUnitBySKU(5949, 200, 100, 98);
            //var qtyKG = StaticValue.ConvertToNewUnitBySKU(5949, 2, 93, 92);

            TRes res = new TRes();
            List<bsto> sou_sto = new List<bsto>();
            List<bsto> des_sto = new List<bsto>();
            var doc = ADO.DataADO.GetInstant().SelectBy<TRes.ViewDocument>("amv_Document", "*", null,
                new SQLConditionCriteria[]
                {
                    new SQLConditionCriteria("ID", reqVO.docID, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("DocumentType_ID", reqVO.docTypeID, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("Status",EntityStatus.REMOVE, SQLOperatorType.NOTEQUALS)
                },
                new SQLOrderByCriteria[] { }, null, null,
                this.BuVO).FirstOrDefault();
            if (doc == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V2001, "ไม่พบเอกสารในระบบ");
            var docItems = ADO.DataADO.GetInstant().SelectBy<amv_DocumentItem>(
                new SQLConditionCriteria[]
                {
                    new SQLConditionCriteria("Document_ID",doc.ID, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("Status",EntityStatus.REMOVE, SQLOperatorType.NOTEQUALS)
                },
                this.BuVO);

           foreach(var dicitem in docItems)
            {
                dicitem.Quantity_Genarate = dicitem.SKUMaster_Info1;
            }

            doc.documentItems = AMWUtil.Common.ObjectUtil.JsonCast<List<amv_DocumentItem>>(docItems);
            res.document = doc;

            if (reqVO.getMapSto && doc.DocumentTypeID.Value.In(1001,1011, 1012, 2003, 2004) && doc.documentItems.Count != 0)
            {
                set_sou_des(doc.ID.Value);
            }
            else
            {

                var docRefIDs = ADO.DataADO.GetInstant().SelectBy<amv_Document>(new SQLConditionCriteria[]
                {
                new SQLConditionCriteria("ParentDocument_ID",doc.ID.Value, SQLOperatorType.EQUALS),
                }, this.BuVO);

                docRefIDs.ForEach(df =>
                {
                    set_sou_des(df.ID.Value);

                });



                //set_sou_des(doc.ID.Value);
            }

            void set_sou_des(long docID)
            {

                var bstos = ADO.StorageObjectADO.GetInstant().ListBaseInDoc(docID, null, null, this.BuVO);


                bstos.ForEach(bs =>
                {
                    var pack = ADO.DataADO.GetInstant().SelectByID<ams_PackMaster>(bs.sou_packID, this.BuVO);
                    var sku = ADO.DataADO.GetInstant().SelectByID<ams_SKUMaster>(pack.SKUMaster_ID, this.BuVO);

                    //    var docSouID = docID;
                    //    var docSouCode = ADO.DataADO.GetInstant().SelectBy<amv_Document>(new SQLConditionCriteria[]
                    //        {
                    //new SQLConditionCriteria("ParentDocument_ID",docSouID, SQLOperatorType.EQUALS),
                    //        }, this.BuVO).FirstOrDefault();

                    //var docDisto = ADO.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(
                    //new SQLConditionCriteria[]
                    //    {
                    //        new SQLConditionCriteria("DocumentItem_ID",bs.docItemID, SQLOperatorType.EQUALS),
                    //        new SQLConditionCriteria("Sou_StorageObject_ID",bs.sou_id, SQLOperatorType.EQUALS),
                    //        new SQLConditionCriteria("Status","0,1", SQLOperatorType.IN),
                    //    },
                    //this.BuVO).FirstOrDefault();

                    //var workQueueDesArea = ADO.WorkQueueADO.GetInstant().Get(docDisto.WorkQueue_ID.Value, this.BuVO);


                    sou_sto.Add(new bsto
                    {


                        objectType = bs.sou_objectType,

                        mstID = bs.sou_mstID,
                        packID = bs.sou_packID,
                        packCode = bs.sou_packCode,
                        packName = bs.sou_packName,
                        skuType = StaticValue.SKUMasterTypes.FirstOrDefault(x => x.ID == sku.SKUMasterType_ID).Code,

                        packQty = bs.sou_packQty,
                        packUnitID = bs.sou_packUnitID,
                        packUnitCode = bs.sou_packUnitCode,
                        //docSouCode = docSouCode.Code == null ? null  : docSouCode.Code,
                        ////docSouID = docSouID,
                        packBaseQty = bs.des_packBaseQty,
                        packBaseUnitID = bs.des_packBaseUnitID,
                        packBaseUnitCode = bs.des_packBaseUnitCode,

                        forCustomerID = bs.sou_forCustomerID,
                        prodDate = bs.sou_prodDate,
                        expDate = bs.sou_expDate,

                        batch = bs.sou_batch,
                        lot = bs.sou_lot,
                        orderNo = bs.sou_orderNo,
                        itemNo = bs.sou_itemNo,

                        status = bs.sou_status,

                        docItemID = bs.docItemID,
                        code = bs.code,
                        name = bs.name,

                        rootID = bs.rootID,
                        rootCode = bs.rootCode,
                        rootName = bs.rootName,
                        distoID = bs.distoID,
                        distoQty = bs.distoQty,
                        distoQtyMax = bs.distoQtyMax,
                        distoUnitID = bs.distoUnitID,
                        distoUnitCode = bs.distoUnitCode,

                        distoBaseQty = bs.distoBaseQty,
                        distoBaseQtyMax = bs.distoBaseQtyMax,
                        distoBaseUnitID = bs.distoBaseUnitID,
                        distoBaseUnitCode = bs.distoBaseUnitCode,



                        areaID = bs.areaID,
                        areaTypeID = StaticValue.AreaMasters.FirstOrDefault(x => x.ID == bs.areaID).AreaMasterType_ID.GetValueInt(),
                        areaCode = bs.areaCode,
                        areaLocationID = bs.areaLocationID,
                        areaLocationCode = bs.areaLocationCode,
                        warehouseID = bs.warehouseID,
                        warehouseCode = bs.warehouseCode,
                        branchID = bs.branchID,
                        branchCode = bs.branchCode,
                        options = bs.options,

                        diItemNo = bs.diItemNo,
                        diAuditStatus = bs.diAuditStatus,
                        diLot = bs.diLot,
                        diCartonNo = bs.diCartonNo,
                        diBatch = bs.diBatch,
                        diIncubationDay = bs.diIncubationDay,
                        diShelfLifeDay = bs.diShelfLifeDay,
                        diOrderNo = bs.diOrderNo,
                        diRef1 = bs.diRef1,
                        diRef2 = bs.diRef2,
                        diRef3 = bs.diRef3,
                        diRef4 = bs.diRef4,
                        diExpireDate = bs.diExpireDate,
                        diProductionDate = bs.diProductionDate,
                        dcCode = bs.dcCode,
                        dcDocType_ID =bs.dcDocType_ID,
                        dcID = bs.dcID



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
                        itemNo = bs.des_itemNo,

                        status = bs.des_status,

                        docItemID = bs.docItemID,
                        code = bs.code,
                        name = bs.name,

                        rootID = bs.rootID,
                        rootCode = bs.rootCode,
                        rootName = bs.rootName,

                        distoID = bs.distoID,
                        distoQty = bs.distoQty,
                        distoQtyMax = bs.distoQtyMax,
                        distoUnitID = bs.distoUnitID,
                        distoUnitCode = bs.distoUnitCode,
                        //distoQtyConverts = Listpack,

                        distoBaseQty = bs.distoBaseQty,
                        distoBaseQtyMax = bs.distoBaseQtyMax,
                        distoBaseUnitID = bs.distoBaseUnitID,
                        distoBaseUnitCode = bs.distoBaseUnitCode,



                        areaID = bs.areaID,
                        areaTypeID = StaticValue.AreaMasters.FirstOrDefault(x => x.ID == bs.areaID).AreaMasterType_ID.GetValueInt(),
                        areaCode = bs.areaCode,
                        areaLocationID = bs.areaLocationID,
                        areaLocationCode = bs.areaLocationCode,
                        warehouseID = bs.warehouseID,
                        warehouseCode = bs.warehouseCode,
                        branchID = bs.branchID,
                        branchCode = bs.branchCode,
                        options = bs.options,
                        diItemNo = bs.diItemNo,
                        diAuditStatus = bs.diAuditStatus,
                        diLot = bs.diLot,
                        diCartonNo = bs.diCartonNo,
                        diBatch = bs.diBatch,
                        diIncubationDay = bs.diIncubationDay,
                        diShelfLifeDay = bs.diShelfLifeDay,
                        diOrderNo = bs.diOrderNo,
                        diRef1 = bs.diRef1,
                        diRef2 = bs.diRef2,
                        diRef3 = bs.diRef3,
                        diRef4 = bs.diRef4,
                        diExpireDate = bs.diExpireDate,
                        diProductionDate = bs.diProductionDate,
                        dcCode = bs.dcCode,
                        dcID = bs.dcID

                    });

                });
                res.sou_bstos = sou_sto;
                res.des_bstos = des_sto;
            }
            return res;
        }
    }
}
