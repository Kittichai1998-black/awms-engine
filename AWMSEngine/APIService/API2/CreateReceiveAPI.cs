using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWMSEngine.Engine.Business.Received;
using AWMSEngine.Engine.General;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Entity;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.Api2
{
    public class CreateReceiveAPI : BaseAPIService
    {

        public override int APIServiceID()
        {
            return 14;
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
                    public decimal qty;
                    public string unit;
                    public string souBranch;
                    public string souWarehouse;
                    public string desBranch;
                    public string desWarehouse;
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
            List<KeyValuePair<string,string>> otherWarehousesTmp = new List<KeyValuePair<string, string>>();

            TModel reqData = AMWUtil.Common.ObjectUtil.DynamicToModel<TModel>(this.RequestVO);
            reqData.documents
                .ForEach(doc => doc.items.FindAll(x => !string.IsNullOrEmpty(x.souWarehouse))
                .ForEach(x => {
                    otherWarehousesTmp.Add(new KeyValuePair<string, string>(x.souBranch, x.souWarehouse));
                    otherWarehousesTmp.Add(new KeyValuePair<string, string>(x.desBranch, x.desWarehouse));
                }));
            var otherWarehouses = otherWarehousesTmp
                .GroupBy(x => new { warehouse = x.Value, branch = x.Key })
                .Where(x => !ADO.StaticValue.StaticValueManager.GetInstant().Warehouses.Any(y => y.Code == x.Key.warehouse))
                .ToList();

            if (otherWarehouses.Count > 0)
            {
                new PutMaster<ams_Warehouse>().Execute(this.Logger, this.BuVO,
                    new PutMaster<ams_Warehouse>.TReq()
                    {
                        datas = otherWarehouses.Select(x =>
                                                        new ams_Warehouse()
                                                        {
                                                            Code = x.Key.warehouse,
                                                            Name = x.Key.warehouse,
                                                            Branch_ID = ADO.StaticValue.StaticValueManager.GetInstant().Branchs.First(y => y.Code == x.Key.branch).ID,
                                                            Status = EntityStatus.ACTIVE
                                                        }).ToList(),
                        whereFields = new List<string>() { "Code" }
                    });
                ADO.StaticValue.StaticValueManager.GetInstant().LoadWarehouse(this.BuVO);
            }

            /////////////////////////////////////////////////
            foreach (var doc in reqData.documents)
            {
                var revision =
                    ADO.DataADO.GetInstant().SelectBy<amt_Document>(new KeyValuePair<string, object>[]{
                    new KeyValuePair<string, object>("RefID",doc.docNo),
                    new KeyValuePair<string, object>("Ref1",doc.docYear),
                    new KeyValuePair<string, object>("DocumentType_ID",DocumentTypeID.SUPER_GOODS_RECEIVED)
                    }, this.BuVO);
                if (revision.Count > 0)
                    doc.remark = "[Revision." + (revision.Count + 1) + "] " + doc.remark;

                var reqDoc = new CreateSGRDocumentByDocLink.TReq()
                {
                    refID = doc.docNo,
                    ref1 = doc.docYear,
                    actionTime = doc.actionDate.Value,
                    documentDate = doc.documentDate.Value,
                    remark = doc.remark,

                    docLinks = doc.items.Select(x => new CreateSGRDocumentByDocLink.TReq.TDocLink()
                    {
                        skuCode = x.code,
                        quantity = x.qty,
                        unitType = x.unit,
                        batch = x.batch,
                        souBranch = x.souBranch,
                        souWarehouseCode = x.souWarehouse,
                        desBranch = x.desBranch,
                        desWarehouseCode = x.desWarehouse,
                        refID = doc.docNo,
                        ref1 = doc.docYear,
                        ref2 = x.movementType,
                    }).ToList()
                };

                var res = new CreateSGRDocumentByDocLink().Execute(
                    this.Logger,
                    this.BuVO,
                    reqDoc);

                doc.code = res.Code;
            }
            return reqData;

        }
    }
}
