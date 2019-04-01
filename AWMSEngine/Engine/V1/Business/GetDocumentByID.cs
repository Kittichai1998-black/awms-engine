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

namespace AWMSEngine.Engine.Business
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
        }
        public class bsto
        {
            public long id;
            public StorageObjectType objectType;

            public long mstID;
            public long packID;
            public string packCode;
            public string packName;

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

            public long distoBaseUnitID;
            public string distoBaseUnitCode;

            public int areaID;
            public string areaCode;
            public int? areaLocationID;
            public string areaLocationCode;
            public int warehouseID;
            public string warehouseCode;
            public int branchID;
            public string branchCode;
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
            doc.documentItems = docItems;
            res.document = doc;

            if (reqVO.getMapSto && doc.documentItems.Count != 0)
            {
                var bstos = ADO.StorageObjectADO.GetInstant().ListBaseInDoc(doc.ID, null, null, this.BuVO);
                bstos.ForEach(bs =>
                {
                    sou_sto.Add(new bsto
                    {
                        id = bs.sou_id,
                        objectType = bs.sou_objectType,

                        mstID = bs.sou_mstID,
                        packID = bs.sou_packID,
                        packCode = bs.sou_packCode,
                        packName = bs.sou_packCode,

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

                        distoBaseQty = bs.distoBaseQty,
                        distoBaseQtyMax = bs.distoBaseQtyMax,
                        distoBaseUnitID = bs.distoBaseUnitID,
                        distoBaseUnitCode = bs.distoBaseUnitCode,

                        areaID = bs.areaID,
                        areaCode = bs.areaCode,
                        areaLocationID = bs.areaLocationID,
                        areaLocationCode = bs.areaLocationCode,
                        warehouseID = bs.warehouseID,
                        warehouseCode = bs.warehouseCode,
                        branchID = bs.branchID,
                        branchCode = bs.branchCode
                    });

                    des_sto.Add(new bsto
                    {
                        id = bs.des_id,
                        objectType = bs.des_objectType,

                        mstID = bs.des_mstID,
                        packID = bs.des_packID,
                        packCode = bs.des_packCode,
                        packName = bs.des_packCode,

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

                        distoBaseQty = bs.distoBaseQty,
                        distoBaseQtyMax = bs.distoBaseQtyMax,
                        distoBaseUnitID = bs.distoBaseUnitID,
                        distoBaseUnitCode = bs.distoBaseUnitCode,

                        areaID = bs.areaID,
                        areaCode = bs.areaCode,
                        areaLocationID = bs.areaLocationID,
                        areaLocationCode = bs.areaLocationCode,
                        warehouseID = bs.warehouseID,
                        warehouseCode = bs.warehouseCode,
                        branchID = bs.branchID,
                        branchCode = bs.branchCode
                    });

                });
                res.sou_bstos = sou_sto;
                res.des_bstos = des_sto;
            }
            return res;
        }
    }
}
