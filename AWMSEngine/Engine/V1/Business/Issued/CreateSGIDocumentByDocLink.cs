using AWMSModel.Constant.EnumConst;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business.Issued
{
    public class CreateSGIDocumentByDocLink : BaseEngine<CreateSGIDocumentByDocLink.TReq, amt_Document>
    {
        public class TReq
        {
            public DateTime? actionTime;
            public DateTime documentDate;
            public string refID;
            public string ref1;
            public string ref2;
            public string options;
            public string remark;

            public List<TDocLink> docLinks;
            public class TDocLink
            {
                public string forCustomerCode;

                public string souWarehouseCode;
                public string souAreaMasterCode;

                public string desCustomerCode;
                public string desSupplierCode;
                public string desWarehouseCode;
                public string desAreaMasterCode;

                public string orderNo;
                public string batch;
                public string lot;
                public string options;

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
            var itemGroups =
                reqVO.docLinks.GroupBy(x => new {
                    souWarehouseCode = x.souWarehouseCode,
                    souAreaMasterCode = x.souAreaMasterCode,
                    desCustomerCode = x.desCustomerCode,
                    desSupplierCode = x.desSupplierCode,
                    desWarehouseCode = x.desWarehouseCode,
                    desAreaMasterCode = x.desAreaMasterCode,
                    forCustomerCode = x.forCustomerCode,
                    batch = x.batch,
                    //lot = x.lot
                }).Select(x => x.Key);

            amt_Document docSGR = new amt_Document()
            {
                RefID = reqVO.refID,
                Ref1 = reqVO.ref1,
                Ref2 = reqVO.ref2,
                Options = reqVO.options,
                Remark = reqVO.remark,
                ActionTime = reqVO.actionTime,
                DocumentDate = reqVO.documentDate,
                DocumentType_ID = DocumentTypeID.SUPER_GOODS_ISSUED,
                EventStatus = DocumentEventStatus.IDLE,

                DocumentItems = new List<amt_DocumentItem>()
            };

            foreach (var ig in itemGroups)
            {
                CreateDocument.TReq docGRReq = new CreateDocument.TReq()
                {
                    batch = ig.batch,
                    //lot = ig.lot,
                    refID = reqVO.refID,
                    ref1 = reqVO.ref1,
                    ref2 = reqVO.ref2,
                    options = reqVO.options,

                    actionTime = reqVO.actionTime,
                    documentDate = reqVO.documentDate,
                    remark = reqVO.remark,
                    forCustomerCode = ig.forCustomerCode,


                    //souCustomerCode = ig.souCustomerCode,
                    //souSupplierCode = ig.souSupplierCode,
                    souBranchCode = null,
                    souWarehouseCode = ig.souWarehouseCode,
                    souAreaMasterCode = null,

                    desBranchCode = null,
                    desWarehouseCode = ig.desWarehouseCode,
                    desAreaMasterCode = ig.desAreaMasterCode,
                    desCustomerCode = ig.desCustomerCode,
                    desSupplierCode = ig.desSupplierCode,
                    
                    issueItems = reqVO.docLinks.Where(x =>
                                                     ig.souWarehouseCode == x.souWarehouseCode &&
                                                     ig.desCustomerCode == x.desCustomerCode &&
                                                     ig.desSupplierCode == x.desSupplierCode &&
                                                     ig.desWarehouseCode == x.desWarehouseCode &&
                                                     ig.desAreaMasterCode == x.desAreaMasterCode &&
                                                     ig.forCustomerCode == x.forCustomerCode
                                                     )
                                                 .Select(x => new CreateDocument.TReq.IssueItem()
                                                 {
                                                     skuCode = x.skuCode,
                                                     quantity = x.quantity,
                                                     unitType = x.unitType,

                                                     refID = x.refID,
                                                     ref1 = x.ref1,
                                                     ref2 = x.ref2,

                                                     lot = x.lot,
                                                     batch = x.batch,
                                                     orderNo = x.orderNo,
                                                     options = x.options,
                                                 }).ToList()
                };
                var docGR = new CreateDocument().Execute(
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
                    Options = docGR.Options,
                    Lot = docGR.Lot,
                    EventStatus = DocumentEventStatus.IDLE
                });
            }

            docSGR = ADO.DocumentADO.GetInstant().Create(docSGR, this.BuVO);


            return docSGR;

        }

    }
}
