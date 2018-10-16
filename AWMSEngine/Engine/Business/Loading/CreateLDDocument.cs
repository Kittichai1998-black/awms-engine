using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business.Loading
{
    public class CreateLDDocument : BaseEngine<CreateLDDocument.TDocReq, amt_Document>
    {

        public class TDocReq
        {
            public string refID;
            
            public long? souBranchID;
            public string souBranchCode;

            public long? souWarehouseID;
            public string souWarehouseCode;

            public long? transportID;
            public string transportCode;

            public DateTime? actionTime;//วันเวลาที่ส่ง
            public DateTime documentDate;
            public string remark;

            public List<DocItem> docItems;
            public class DocItem
            {
                public long issuedDocID;
            }
        }

        protected override amt_Document ExecuteEngine(TDocReq reqVO)
        {
            if (reqVO.docItems.GroupBy(x => x.issuedDocID).Any(x => x.Count() > 1))
                throw new AMWUtil.Exception.AMWException(this.Logger, AMWExceptionCode.V1002, "IssuedDocID Duplicate in List ");

            var newDoc = this.NewDocument(reqVO);
            newDoc.DocumentItems = this.NewDocumentItem(reqVO, newDoc);
            var res = ADO.DocumentADO.GetInstant().Create(newDoc, this.BuVO);

            return res;
        }

        private amt_Document NewDocument(TDocReq reqVO)
        {
            var transportModel = reqVO.transportID.HasValue ?
                 this.StaticValue.Transport.FirstOrDefault(x => x.ID == reqVO.transportID) :
                 this.StaticValue.Transport.FirstOrDefault(x => x.Code == reqVO.transportCode);
            
            var souWarehouseModel =
                reqVO.souWarehouseID.HasValue ?
                    this.StaticValue.Warehouses.FirstOrDefault(x => x.ID == reqVO.souWarehouseID) :
                    !string.IsNullOrWhiteSpace(reqVO.souBranchCode) ?
                        this.StaticValue.Warehouses.FirstOrDefault(x => x.Code == reqVO.souWarehouseCode) :
                        null;
            var souBranchModel =
                reqVO.souBranchID.HasValue ?
                this.StaticValue.Branchs.FirstOrDefault(x => x.ID == reqVO.souBranchID) :
                !string.IsNullOrWhiteSpace(reqVO.souBranchCode) ?
                    this.StaticValue.Branchs.FirstOrDefault(x => x.Code == reqVO.souBranchCode) :
                    souWarehouseModel != null ?
                        this.StaticValue.Branchs.FirstOrDefault(x => x.ID == souWarehouseModel.Branch_ID) :
                        null;

            if (souWarehouseModel == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "souWarehouse ไม่ถูกต้อง");

            amt_Document newDoc = new amt_Document()
            {
                RefID = reqVO.refID,

                Sou_Warehouse_ID = souWarehouseModel.ID,
                Sou_Branch_ID = souBranchModel.ID,

                ActionTime = reqVO.actionTime,
                DocumentDate = reqVO.documentDate,
                DocumentType_ID = DocumentTypeID.LOADING,

                Remark = reqVO.remark,

                EventStatus = DocumentEventStatus.IDEL,

                DocumentItems = new List<amt_DocumentItem>()
            };
            return newDoc;
        }

        private List<amt_DocumentItem> NewDocumentItem(TDocReq reqVO ,amt_Document newDoc)
        {
            List<amt_DocumentItem> newDocItems = new List<amt_DocumentItem>();
            //สร้าง Item Document สำหรับ loading
            foreach (var docItem in reqVO.docItems)
            {
                var issuedDoc = ADO.DataADO.GetInstant().SelectBy<amt_Document>(
                    new KeyValuePair<string, object>[]{
                        new KeyValuePair<string, object>("ID", docItem.issuedDocID),
                        new KeyValuePair<string, object>("DocumentType_ID", DocumentTypeID.GOODS_ISSUED),
                        new KeyValuePair<string, object>("Status", EntityStatus.ACTIVE)
                    },
                    this.BuVO).FirstOrDefault();
                if (newDoc != null && issuedDoc.Sou_Warehouse_ID != newDoc.Sou_Warehouse_ID)
                    throw new AMWException(this.Logger, AMWExceptionCode.V2001, "SouWarehouse Issued Document ไม่ตรงกับ Loading Document");
                if (newDoc != null && issuedDoc.Sou_Branch_ID != newDoc.Sou_Branch_ID)
                    throw new AMWException(this.Logger, AMWExceptionCode.V2001, "SouBranch Issued Document ไม่ตรงกับ Loading Document");
                if (issuedDoc == null)
                    throw new AMWException(this.Logger, AMWExceptionCode.V2001, "ไม่พบ Good Issued Document ID " + docItem.issuedDocID + " ในฐานข้อมูล");
                var newDocItem = new amt_DocumentItem()
                {
                    Code = issuedDoc.Code,
                    LinkDocument_ID = issuedDoc.ID.Value,
                    EventStatus = DocumentEventStatus.IDEL
                };
                newDocItems.Add(newDocItem);

            }

            return newDocItems;
        }
    }
}
