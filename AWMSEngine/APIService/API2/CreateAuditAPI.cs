using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.Engine.Business.Auditor;
using AWMSEngine.Engine.Business.Issued;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.Api2
{
    public class CreateAuditAPI : BaseAPIService
    {
        public override int APIServiceID()
        {
            return 12;
        }

        public class TModel
        {
            public List<TDocument> documents;
            public class TDocument
            {
                public string code;
                public string docNo;//refID
                public string docYear;//ref1
                public DateTime? actionDate;
                public DateTime? documentDate;
                public string remark;
                public List<TItem> items;
                public class TItem
                {
                    public string code;
                    public string item;
                    public string batch;
                    public string souBranch;
                    public string souWarehouse;
                    public string unit;
                }
            }
        }
        public CreateAuditAPI(ControllerBase controllerAPI, bool isAuthenAuthorize = true) : base(controllerAPI, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            TModel reqData = ObjectUtil.DynamicToModel<TModel>(this.RequestVO);


            this.BeginTransaction();
            foreach (var doc in reqData.documents)
            {
                if (doc.items.Any(x => x.souWarehouse != "5005"))
                    throw new AMWException(this.Logger, AMWExceptionCode.V1002, "นับสินค้า สำหรับคลัง AS/RS(5005) เท่านั้น");

                var revision =
                    ADO.DataADO.GetInstant().SelectBy<amt_Document>(new KeyValuePair<string, object>[]{
                    new KeyValuePair<string, object>("RefID",doc.docNo),
                    new KeyValuePair<string, object>("Ref1",doc.docYear),
                    new KeyValuePair<string, object>("DocumentType_ID",DocumentTypeID.AUDIT)
                    }, this.BuVO);
                if (revision.Count > 0)
                    doc.remark = "[Revision." + (revision.Count + 1) + "] " + doc.remark;

                var reqDoc = new CreateADDocument.TReq()
                {
                    refID = doc.docNo,
                    ref1 = doc.docYear,
                    actionTime = doc.actionDate.Value,
                    documentDate = doc.documentDate.Value,
                    remark = doc.remark,
                    souWarehouseCode = "5005",

                    docItems = doc.items.Select(x => new CreateADDocument.TReq.TItem()
                    {
                        skuCode = x.code,
                        unitType = x.unit,
                        batch = x.batch,
                        options = "DocItem=" + x.item
                    }).ToList()
                };

                var res = new CreateADDocument().Execute(
                    this.Logger,
                    this.BuVO,
                    reqDoc);

                doc.code = res.Code;
            }

            return reqData;
        }


    }
}
