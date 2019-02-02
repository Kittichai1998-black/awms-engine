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
    public class ClosedPIDocument : BaseEngine<ClosedPIDocument.TDocReq, List<SAPResposneAPI>>
    {
        public class TDocReq
        {
            public long[] docIDs;
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

        protected override List<SAPResposneAPI> ExecuteEngine(TDocReq reqVO)
        {
            List<SAPResposneAPI> sapAPIRes = new List<SAPResposneAPI>();
            foreach (var docID in reqVO.docIDs)
            {
                var sapReq = new SAPReq();
                var sapItems = new List<SAPReq.Item>();
                var doc = ADO.DocumentADO.GetInstant().Get(docID, this.BuVO);
                var docItems = ADO.DocumentADO.GetInstant().ListItem(docID, this.BuVO);
                var branch = this.StaticValue.Branchs.Where(x => x.ID == doc.Sou_Branch_ID.Value).FirstOrDefault().Code;
                var warehouse = this.StaticValue.Warehouses.Where(x => x.ID == doc.Sou_Warehouse_ID.Value).FirstOrDefault().Code;

                if(doc.RefID == "" || doc.RefID == null)
                {
                    ADO.DocumentADO.GetInstant().UpdateStatusToChild(docID, null, null, DocumentEventStatus.CLOSED, this.BuVO);
                    sapAPIRes = null;
                }
                else
                {
                    sapReq.HEADER_DATA = new SAPReq.Header()
                    {
                        PHYSINVENTORY = doc.RefID,
                        COUNT_DATE = doc.ModifyTime.Value.ToString("yyyyMMdd", new CultureInfo("en-US")),
                        PHYSICAL_YEAR = doc.CreateTime.ToString("yyyy", new CultureInfo("en-US"))
                    };

                    docItems.ForEach(i =>
                    {
                        dynamic getSto;

                        if(i.Batch == null)
                        {
                            getSto = ADO.DataADO.GetInstant().SelectBy<amt_StorageObject>(new SQLConditionCriteria[]{
                                            new SQLConditionCriteria("Code", i.Code, SQLOperatorType.EQUALS),
                                            new SQLConditionCriteria("Status", EntityStatus.ACTIVE, SQLOperatorType.EQUALS),
                                        }, this.BuVO)
                            .GroupBy(s => new { s.Code, s.Batch })
                            .Select(s => new { s.Key.Code, s.Key.Batch, Qty = s.Sum(xx => (decimal)xx.Quantity) })
                            .FirstOrDefault();
                        }

                        else
                            getSto = ADO.DataADO.GetInstant().SelectBy<amt_StorageObject>(new SQLConditionCriteria[]{
                                            new SQLConditionCriteria("Code", i.Code, SQLOperatorType.EQUALS),
                                            new SQLConditionCriteria("Batch", i.Batch, SQLOperatorType.EQUALS),
                                            new SQLConditionCriteria("Status", EntityStatus.ACTIVE, SQLOperatorType.EQUALS),
                                        }, this.BuVO)
                            .GroupBy(s => new { s.Code, s.Batch })
                            .Select(s => new { s.Key.Code, s.Key.Batch, Qty = s.Sum(xx => (decimal)xx.Quantity) })
                            .FirstOrDefault();

                        var unit = this.StaticValue.UnitTypes.Where(un => un.ID == i.UnitType_ID).FirstOrDefault();

                        if(getSto != null)
                        {
                            sapItems.Add(new SAPReq.Item
                            {
                                PHYSINVENTORY = doc.RefID,
                                PHYSICAL_YEAR = doc.Ref1,
                                ITEM = i.Options == null || i.Options=="" ? "" : i.Options.Split("=")[1],
                                MATERIAL = (string)getSto.Code,
                                PLANT = branch,
                                STGE_LOC = warehouse,
                                BATCH = (string)getSto.Batch,
                                STOCK_TYPE = "1",
                                ENTRY_QNT = getSto.Qty.ToString(),
                                ENTRY_UOM = unit.Code,
                                ZERO_COUNT = getSto == null ? "X" : (decimal)getSto.Qty == 0 ? "X" : "",
                            });
                        }
                        else
                        {
                            sapItems.Add(new SAPReq.Item
                            {
                                PHYSINVENTORY = doc.RefID,
                                PHYSICAL_YEAR = doc.Ref1,
                                ITEM = i.Options == null || i.Options == "" ? "" : i.Options.Split("=")[1],
                                MATERIAL = i.Code,
                                PLANT = branch,
                                STGE_LOC = warehouse,
                                BATCH = i.Batch,
                                STOCK_TYPE = "1",
                                ENTRY_QNT = "0",
                                ENTRY_UOM = unit.Code,
                                ZERO_COUNT = "X",
                            });
                        }
                    });


                    sapReq.ITEM_DATA = sapItems;
                    var res = SAPInterfaceADO.GetInstant().MMI0009_CONFORM_PHYSICALCOUNT(sapReq, this.BuVO);
                    if (res.docstatus == "0")
                    {
                        ADO.DocumentADO.GetInstant().UpdateStatusToChild(docID, null, null, DocumentEventStatus.CLOSED, this.BuVO);
                    }
                    sapAPIRes.Add(res);
                }
            }
            return sapAPIRes;
        }
        
    }
}