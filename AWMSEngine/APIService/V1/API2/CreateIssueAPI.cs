using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AWMSEngine.Engine.Business.Issued;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.Api2
{
    public class CreateIssueAPI : BaseAPIService
    {
        public class TModel
        {
            public List<TDocument> documents;
            public class TDocument
            {
                public string code;
                public string docNo;//refID
                public string docYear;//ref1
                public string docType;//ref2
                public DateTime? actionDate;
                public DateTime? documentDate;
                public string remark;
                public List<TItem> items;
                public class TItem
                {
                    public string code;
                    public string item;
                    public decimal qty;
                    public string unit;
                    public string batch;
                    public string souWarehouse;
                    public string desCustomer;
                    public string desCustomerName;
                    public string desSupplier;
                    public string desSupplierName;

                    public string movementType;//ref2
                }
            }
        }
        public CreateIssueAPI(ControllerBase controllerAPI,int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            TModel reqData = ObjectUtil.DynamicToModel<TModel>(this.RequestVO);

            this.PutCustomer(reqData);
            this.PutSuplier(reqData);

            this.BeginTransaction();
            foreach (var doc in reqData.documents)
            {
                var revision =
                    ADO.DataADO.GetInstant().SelectBy<amt_Document>(new KeyValuePair<string, object>[]{
                    new KeyValuePair<string, object>("RefID",doc.docNo),
                    new KeyValuePair<string, object>("Ref1",doc.docYear),
                    new KeyValuePair<string, object>("DocumentType_ID",DocumentTypeID.SUPER_GOODS_ISSUED)
                    }, this.BuVO);
                if (revision.Count > 0)
                    doc.remark = "[Revision." + (revision.Count + 1) + "] " + doc.remark;

                var reqDoc = new CreateSGIDocumentByDocLink.TReq()
                {
                    refID = doc.docNo,
                    ref1 = doc.docYear,
                    ref2 = doc.items.First().movementType,
                    options = "DocType=" + doc.docType,
                    actionTime = doc.actionDate.Value,
                    documentDate = doc.documentDate.Value,
                    remark = doc.remark,

                    docLinks = doc.items.Select(x => new CreateSGIDocumentByDocLink.TReq.TDocLink()
                    {
                        skuCode = x.code,
                        quantity = x.qty,
                        unitType = x.unit,
                        batch = x.batch,
                        souWarehouseCode = x.souWarehouse ?? "5005",
                        desCustomerCode = x.desCustomer,
                        desSupplierCode = x.desSupplier,
                        refID = doc.docNo,
                        ref1 = doc.docYear,
                        ref2 = x.movementType,
                        options = "DocItem=" + x.item
                    }).ToList()
                };

                var res = new CreateSGIDocumentByDocLink().Execute(
                    this.Logger,
                    this.BuVO,
                    reqDoc);

                doc.code = res.Code;
            }

            return reqData;
        }

        private void PutCustomer(TModel reqData)
        {
            List<KeyValuePair<string, string>> txtMsts = new List<KeyValuePair<string, string>>();
            reqData.documents.ForEach(x =>
                                        x.items.FindAll(y => !string.IsNullOrEmpty(y.desCustomer))
                                            .ForEach(y => txtMsts.Add(new KeyValuePair<string, string>(y.desCustomer, y.desCustomerName))));
            txtMsts = txtMsts.Distinct()
                .Where(x => !ADO.StaticValue.StaticValueManager.GetInstant().Customers.Any(y => y.Code == x.Key && y.Name == x.Value))
                .ToList();

            if(txtMsts.Count() > 0)
            {
                this.BeginTransaction();
                new Engine.General.PutMaster<ams_Customer>().Execute(this.Logger, this.BuVO,
                    new Engine.General.PutMaster<ams_Customer>.TReq()
                    {
                        datas = txtMsts.Select(x => new ams_Customer()
                        {
                            Code = x.Key,
                            Name = x.Value,
                            Status = AWMSModel.Constant.EnumConst.EntityStatus.ACTIVE,
                        }).ToList(),
                        whereFields = new List<string>() { "Code" }
                    });

                ADO.StaticValue.StaticValueManager.GetInstant().LoadCustomer(this.BuVO);
                this.CommitTransaction();
            }
        }
        private void PutSuplier(TModel reqData)
        {
            List<KeyValuePair<string, string>> txtMsts = new List<KeyValuePair<string, string>>();
            reqData.documents.ForEach(x =>
                                        x.items.FindAll(y => !string.IsNullOrEmpty(y.desSupplier))
                                            .ForEach(y => txtMsts.Add(new KeyValuePair<string, string>(y.desSupplier, y.desSupplierName))));
            txtMsts = txtMsts.Distinct()
                .Where(x => !ADO.StaticValue.StaticValueManager.GetInstant().Customers.Any(y => y.Code == x.Key && y.Name == x.Value))
                .ToList();

            if(txtMsts.Count() > 0)
            {
                this.BeginTransaction();
                new Engine.General.PutMaster<ams_Supplier>().Execute(this.Logger, this.BuVO,
                    new Engine.General.PutMaster<ams_Supplier>.TReq()
                    {
                        datas = txtMsts.Select(x => new ams_Supplier()
                        {
                            Code = x.Key,
                            Name = x.Value,
                            Status = AWMSModel.Constant.EnumConst.EntityStatus.ACTIVE,
                        }).ToList(),
                        whereFields = new List<string>() { "Code" }
                    });

                ADO.StaticValue.StaticValueManager.GetInstant().LoadSupplier(this.BuVO);
                this.CommitTransaction();

            }
        }
    }
}
