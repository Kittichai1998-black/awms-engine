using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWMSEngine.Engine.Business.Received;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.Api2
{
    public class CreateReceiveAPI : BaseAPIService
    {
        public class TModel
        {
            public List<TDocument> documents;
            public class TDocument
            {
                public string code;
                public string matDocNo;//refID
                public string matDocYear;//ref1
                public DateTime? actionDate;
                public DateTime? documentDate;
                public string remark;
                public List<TItem> items;
                public class TItem
                {
                    public string code;
                    public int qty;
                    public string unit;
                    public string souWarehouse;
                    public string movementType;//ref2
                    public string batch;
                }
            }
        }

        public CreateReceiveAPI(ControllerBase controllerAPI) : base(controllerAPI)
        {
        }


        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            TModel model = AMWUtil.Common.ObjectUtil.DynamicToModel<TModel>(this.RequestVO);
            foreach(var doc in model.documents)
            {
                var reqDoc = new CreateSGRDocumentByDocLink.TReq()
                {
                    refID = doc.matDocNo,
                    ref1 = doc.matDocYear,
                    actionTime = doc.actionDate.Value,
                    documentDate = doc.documentDate.Value,
                    remark = doc.remark,

                    docLinks = doc.items.Select(x => new CreateSGRDocumentByDocLink.TReq.TDocLink()
                    {
                        skuCode = x.code,
                        quantity = x.qty,
                        packItemUnit = x.unit,
                        batch = x.batch,
                        souWarehouseCode = x.souWarehouse,
                        refID = doc.matDocNo,
                        ref1 = doc.matDocYear,
                        ref2 = x.movementType,
                    }).ToList()
                };

                var res = new CreateSGRDocumentByDocLink().Execute(
                    this.Logger,
                    this.BuVO,
                    reqDoc);

                doc.code = res.Code;
            }
            return model;

        }
    }
}
