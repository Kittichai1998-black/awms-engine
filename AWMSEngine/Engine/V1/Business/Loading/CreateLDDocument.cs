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

            public long? desCustomerID;
            public string desCustomerCode;

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
            var desCustomer = reqVO.desCustomerID.HasValue ?
                 this.StaticValue.Customers.FirstOrDefault(x => x.ID == reqVO.desCustomerID) :
                 this.StaticValue.Customers.FirstOrDefault(x => x.Code == reqVO.desCustomerCode);

            var transportModel = reqVO.transportID.HasValue ?
                 this.StaticValue.Transports.FirstOrDefault(x => x.ID == reqVO.transportID) :
                 this.StaticValue.Transports.FirstOrDefault(x => x.Code == reqVO.transportCode);
            
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

            if (desCustomer == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Customer ไม่ถูกต้อง");
            if (transportModel == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Transport ไม่ถูกต้อง");
            if (souWarehouseModel == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Warehouse ไม่ถูกต้อง");
            if (souBranchModel == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Branch ไม่ถูกต้อง");

            amt_Document newDoc = new amt_Document()
            {
                RefID = reqVO.refID,
                Transport_ID = transportModel.ID,

                Sou_Warehouse_ID = souWarehouseModel.ID,
                Sou_Branch_ID = souBranchModel.ID,

                Des_Customer_ID = desCustomer.ID,

                ActionTime = reqVO.actionTime,
                DocumentDate = reqVO.documentDate,
                DocumentType_ID = DocumentTypeID.LOADING,

                Remark = reqVO.remark,

                EventStatus = DocumentEventStatus.NEW,

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
                        new KeyValuePair<string, object>("DocumentType_ID", DocumentTypeID.GOODS_ISSUED)
                    },
                    this.BuVO).FirstOrDefault();
                if (issuedDoc == null)
                    throw new AMWException(this.Logger, AMWExceptionCode.V2001, "ไม่พบ Good Issued Document ID " + docItem.issuedDocID + " ในฐานข้อมูล");
                if (issuedDoc.Sou_Warehouse_ID != newDoc.Sou_Warehouse_ID)
                    throw new AMWException(this.Logger, AMWExceptionCode.V2001, "SouWarehouse Issued Document ไม่ตรงกับ Loading Document");
                if (issuedDoc.Sou_Branch_ID != newDoc.Sou_Branch_ID)
                    throw new AMWException(this.Logger, AMWExceptionCode.V2001, "SouBranch Issued Document ไม่ตรงกับ Loading Document");
                if (issuedDoc.EventStatus != DocumentEventStatus.WORKING && issuedDoc.EventStatus != DocumentEventStatus.WORKED)
                    throw new AMWException(this.Logger, AMWExceptionCode.V2001, "Good Issued Document ID '" + docItem.issuedDocID + "' มีสถานะ '" + issuedDoc.EventStatus.ToString() + "'");
                var newDocItem = new amt_DocumentItem()
                {
                    Code = issuedDoc.Code,
                    LinkDocument_ID = issuedDoc.ID.Value,
                    EventStatus = DocumentEventStatus.NEW
                };
                newDocItems.Add(newDocItem);

            }

            return newDocItems;
        }
    }
}
