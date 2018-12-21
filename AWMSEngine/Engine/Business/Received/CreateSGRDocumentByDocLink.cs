using AWMSModel.Constant.EnumConst;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business.Received
{
    public class CreateSGRDocumentByDocLink : BaseEngine<CreateSGRDocumentByDocLink.TReq, amt_Document>
    {
        public class TReq
        {
            public DateTime? actionTime;
            public DateTime documentDate;
            public string refID;
            public string ref1;
            public string ref2;
            public string remark;

            public List<TDocLink> docLinks;
            public class TDocLink
            {
                public string forCustomerCode;

                public string souCustomerCode;
                public string souSupplierCode;
                public string souWarehouseCode;
                public string souAreaMasterCode;

                public string desWarehouseCode;
                public string desAreaMasterCode;

                public string orderNo;
                public string batch;
                public string lot;
                public string refID;
                public string ref1;
                public string ref2;

                public string skuCode;
                public decimal? quantity;
                public string unitType;
            }
        }

        protected override amt_Document ExecuteEngine(TReq reqVO)
        {
            List<CreateGRDocument> createDocs = new List<CreateGRDocument>();
            var itemGroups = reqVO.docLinks.GroupBy(x => new {
                                                souWarehouseCode = x.souWarehouseCode,
                                                souCustomerCode = x.souCustomerCode,
                                                souSupplierCode = x.souSupplierCode,
                                                desWarehouseCode = x.desWarehouseCode,
                                                desAreaMasterCode = x.desAreaMasterCode,
                                                forCustomerCode = x.forCustomerCode,
                                                //batch = x.batch,
                                                //lot = x.lot
                                            }).Select(x=>x.Key);

            amt_Document docSGR = new amt_Document()
            {
                RefID = reqVO.refID,
                Ref1 = reqVO.ref1,
                Ref2 = reqVO.ref2,
                Remark = reqVO.remark,
                ActionTime = reqVO.actionTime,
                DocumentDate = reqVO.documentDate,
                DocumentType_ID = DocumentTypeID.SUPER_GOODS_RECEIVED,
                EventStatus = DocumentEventStatus.IDEL,

                DocumentItems = new List<amt_DocumentItem>()
            };

            foreach (var ig in itemGroups)
            {
                CreateGRDocument.TReq docGRReq = new CreateGRDocument.TReq()
                {
                    //batch = ig.batch,
                    //lot = ig.lot,
                    refID = reqVO.refID,
                    ref1 = reqVO.ref1,
                    ref2 = reqVO.ref2,
                    actionTime = reqVO.actionTime,
                    documentDate = reqVO.documentDate,
                    remark = reqVO.remark,
                    forCustomerCode = ig.forCustomerCode,

                    souCustomerCode = ig.souCustomerCode,
                    souSupplierCode = ig.souSupplierCode,
                    souBranchCode = null,
                    souWarehouseCode = ig.souWarehouseCode,
                    souAreaMasterCode = null,

                    desBranchCode = null,
                    desWarehouseCode = ig.desWarehouseCode,
                    desAreaMasterCode = ig.desAreaMasterCode,
                    
                    receiveItems = reqVO.docLinks.Where(x =>
                                                     ig.souWarehouseCode == x.souWarehouseCode &&
                                                     ig.souCustomerCode == x.souCustomerCode &&
                                                     ig.souSupplierCode == x.souSupplierCode &&
                                                     ig.desWarehouseCode == x.desWarehouseCode &&
                                                     ig.desAreaMasterCode == x.desAreaMasterCode &&
                                                     ig.forCustomerCode == x.forCustomerCode
                                                     //&&
                                                     //ig.lot == x.lot &&
                                                     //ig.batch == x.batch
                                                     )
                                                 .Select(x => new CreateGRDocument.TReq.ReceiveItem()
                                                 {
                                                     skuCode = x.skuCode,
                                                     quantity = x.quantity,
                                                     unitType = x.unitType,

                                                     refID = x.refID,
                                                     ref1 = x.ref1,
                                                     ref2 = x.ref2,

                                                     lot = x.lot,
                                                     batch = x.batch,
                                                     orderNo = x.orderNo
                                                 }).ToList()
                };
                var docGR = new CreateGRDocument().Execute(
                    this.Logger,
                    this.BuVO,
                    docGRReq);

                docSGR.DocumentItems.Add(new amt_DocumentItem()
                {
                    Code = docGR.Code,
                    LinkDocument_ID = docGR.ID,
                    Ref1 = docGR.Ref1,
                    Ref2 = docGR.Ref2,
                    RefID = docGR.RefID,
                    Batch = docGR.Batch,
                    Lot = docGR.Lot,
                    EventStatus = DocumentEventStatus.IDEL
                });
            }

            docSGR = ADO.DocumentADO.GetInstant().Create(docSGR, this.BuVO);


            return docSGR;

        }

    }
}
