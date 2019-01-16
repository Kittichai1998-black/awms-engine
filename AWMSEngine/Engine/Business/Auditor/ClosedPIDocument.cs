using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.ADO.SAPApi;
using AWMSEngine.Engine.Business.WorkQueue;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business.Auditor
{
    public class ClosedPIDocument : BaseEngine<ClosedPIDocument.TDocReq, SAPResposneAPI>
    {
        public class TDocReq
        {
            public long docID;
        }

        private class SAPReq
        {
            public Header HEADER_DATA;
            public List<Item> ITEM_DATA;
            public class Header
            {
                public string PHYSINVENTORY;
                public string PHYSICAL_YEAR;
                public string COUNT_DATE;
            }
            public class Item
            {
                public string PHYSINVENTORY;
                public string PHYSICAL_YEAR;
                public string ITEM;
                public string MATERIAL;
                public string PLANT;
                public string STGE_LOC;
                public string BATCH;
                public string STOCK_TYPE;
                public string ENTRY_QNT;
                public string ENTRY_UOM;
                public string ZERO_COUNT;
            }
        }

        protected override SAPResposneAPI ExecuteEngine(TDocReq reqVO)
        {
            var sapReq = new SAPReq();
            var sapItems = new List<SAPReq.Item>();
            var doc = ADO.DocumentADO.GetInstant().Get(reqVO.docID, this.BuVO);
            var docItems = ADO.DocumentADO.GetInstant().ListItem(reqVO.docID, this.BuVO);
            var branch = this.StaticValue.Branchs.Where(x => x.ID == doc.Sou_Branch_ID.Value).FirstOrDefault().Code;
            var warehouse = this.StaticValue.Warehouses.Where(x => x.ID == doc.Sou_Warehouse_ID.Value).FirstOrDefault().Code;

            sapReq.HEADER_DATA = new SAPReq.Header()
            {
                PHYSINVENTORY = doc.RefID,
                COUNT_DATE = doc.ModifyTime.Value.ToString("yyyyMMdd", new CultureInfo("en-US")),
                PHYSICAL_YEAR = doc.CreateTime.ToString("yyyy", new CultureInfo("en-US"))
            };
            var disto = ADO.DocumentADO.GetInstant().ListStoInDocs(reqVO.docID, this.BuVO)
                .GroupBy(g => new { g.StorageObject_ID, g.DocumentItem_ID})
                .Select(x=> new { documentItem_ID = x.Key.DocumentItem_ID,
                    storageObject_ID = x.Key.StorageObject_ID,
                    quantity = x.Sum(y=> y.Quantity)}).ToList();

            var distogroup = ADO.DocumentADO.GetInstant().ListStoInDocs(reqVO.docID, this.BuVO)
                .GroupBy(g => new { g.DocumentItem_ID })
                .Select(x => new {
                    documentItem_ID = x.Key.DocumentItem_ID,
                    quantity = x.Sum(y => y.Quantity)
                }).ToList();

            docItems.ForEach(i =>
            {
                var distores = disto.Where(x => i.ID == x.documentItem_ID).ToList();
                if (distores.Count > 0)
                {
                    disto.ForEach(x =>
                    {
                        if(x.documentItem_ID == i.ID)
                        {
                            var sto = ADO.StorageObjectADO.GetInstant().Get(x.storageObject_ID, StorageObjectType.PACK, false, false, this.BuVO);
                            var countQty = sto.qty;

                            var sapLists = sapItems.Where(sap => sap.MATERIAL == sto.code && sap.BATCH == sto.batch).FirstOrDefault();
                            if(sapLists != null)
                            {
                                var newQty = Convert.ToDecimal(sapLists.ENTRY_QNT) + sto.qty;
                                sapLists.ENTRY_QNT = newQty.ToString();
                                sapLists.ZERO_COUNT = "";
                            }
                            else
                            {
                                sapItems.Add(new SAPReq.Item
                                {
                                    PHYSINVENTORY = doc.RefID,
                                    PHYSICAL_YEAR = doc.Ref1,
                                    ITEM = i.Options.Split("=")[1],
                                    MATERIAL = sto.code,
                                    PLANT = branch,
                                    STGE_LOC = warehouse,
                                    BATCH = sto.batch,
                                    STOCK_TYPE = "1",
                                    ENTRY_QNT = countQty.ToString(),
                                    ENTRY_UOM = sto.unitCode,
                                    ZERO_COUNT = sto == null ? "X" : sto.qty == 0 ? "X" : "",
                                });
                            }
                        }
                    });
                }
                else
                {
                    var unitType = this.StaticValue.UnitTypes.Where(x => x.ID == i.UnitType_ID).FirstOrDefault().Code;
                    sapItems.Add(new SAPReq.Item
                    {
                        PHYSINVENTORY = doc.RefID,
                        PHYSICAL_YEAR = doc.Ref1,
                        ITEM = i.Options.Split("=")[1],
                        MATERIAL = i.Code,
                        PLANT = branch,
                        STGE_LOC = warehouse,
                        BATCH = i.Batch,
                        STOCK_TYPE = "1",
                        ENTRY_QNT = "0",
                        ENTRY_UOM = unitType,
                        ZERO_COUNT = "X",
                    });
                }
            });

            
            sapReq.ITEM_DATA = sapItems;
            string sJSONResponse = JsonConvert.SerializeObject(sapReq);
            var res = SAPInterfaceADO.GetInstant().MMI0009_CONFORM_PHYSICALCOUNT(sapReq, this.BuVO);
            if(res.docstatus == "0")
            {
                ADO.DocumentADO.GetInstant().UpdateStatusToChild(reqVO.docID, null, null, DocumentEventStatus.CLOSED, this.BuVO);
            }
            return res;
        }
        
    }
}