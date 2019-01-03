using AMWUtil.Common;
using AWMSEngine.APIService.Api2;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business.Issued
{
    public class UpdateGIDocumentBeforProcessQueue : BaseEngine<UpdateGIDocumentBeforProcessQueue.TReq, UpdateGIDocumentBeforProcessQueue.TRes>
    {
        public class TReq
        {
            public List<long> docIDs;
        }
        public class TRes
        {
            public List<amt_Document> documents;
        }

        protected override TRes ExecuteEngine(TReq reqVO)
        {
            TRes res = new TRes();
            res.documents = new List<amt_Document>();

            var dbDocs = ADO.DocumentADO.GetInstant().List(reqVO.docIDs, this.BuVO);
            dbDocs.ForEach(x => x.DocumentItems = ADO.DocumentADO.GetInstant().ListItem(x.ID.Value, this.BuVO));

            var sapDOs = new List<CreateIssueAPI.TModel.TDocument>();
            foreach (string refID in dbDocs.GroupBy(x => x.RefID).Select(x => x.Key))
            {
                ADO.SAPApi.SAPInterfaceADO.MMI0008_1 tReq =
                    new ADO.SAPApi.SAPInterfaceADO.MMI0008_1()
                    {
                        HEADER_DATA = new ADO.SAPApi.SAPInterfaceADO.MMI0008_1.THeader()
                        {
                            DELIV_ITEM = refID,
                            DELIV_NUMB = null
                        }
                    };
                var sapDO = ADO.SAPApi.SAPInterfaceADO.GetInstant().MMI0008_1_DO_INFO(tReq, this.BuVO);
                sapDOs.Add(sapDO);
            }

            foreach (var sapDO in sapDOs)
            {
                foreach (var sapDOItem in sapDO.items)
                {
                    var docs = res.documents.FindAll(x => x.RefID == sapDO.docNo);
                    amt_DocumentItem refDocItem = null;
                    docs.ForEach(d => {
                        refDocItem = d.DocumentItems.FirstOrDefault(di => ObjectUtil.QryStrGetValue(di.Options, "DocItem") == sapDOItem.item);
                    });

                    if (refDocItem == null)
                    {
                        //Create Doc Item
                    }
                    else
                    {
                        var sapUnit = this.StaticValue.UnitTypes.First(x => x.Code == sapDOItem.unit && x.ObjectType == StorageObjectType.PACK);
                        var newUnit = this.StaticValue.ConvertToBaseUnitBySKU(refDocItem.SKUMaster_ID.Value, sapDOItem.qty, sapUnit.ID.Value);

                        refDocItem.Code = sapDOItem.code;
                        refDocItem.Quantity = newUnit.qty;
                        refDocItem.UnitType_ID = newUnit.unitType_ID;
                        refDocItem.BaseQuantity = newUnit.baseQty;
                        refDocItem.BaseUnitType_ID = newUnit.baseUnitType_ID;


                        /*public string code;
                        public string item;
                        public decimal qty;
                        public string unit;
                        public string batch;
                        public string souWarehouse;
                        public string desCustomer;
                        public string desCustomerName;
                        public string desSupplier;
                        public string desSupplierName;

                        public string movementType;//ref2*/
                    }
                }
            }

            return null;
        }

    }
}
