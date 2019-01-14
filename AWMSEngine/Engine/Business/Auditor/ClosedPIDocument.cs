using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.ADO.SAPApi;
using AWMSEngine.Engine.Business.WorkQueue;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
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
                public string FISCALYEAR;
                public string COUNT_DATE;
            }
            public class Item
            {
                public string PHYSINVENTORY;
                public string FISCALYEAR;
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
            sapReq.HEADER_DATA = new SAPReq.Header()
            {
                PHYSINVENTORY = doc.Code,
                COUNT_DATE = doc.ModifyTime.Value.ToString("yyyyMMdd"),
                FISCALYEAR = doc.CreateTime.ToString("yyyy")
            };
            var docItems = ADO.DocumentADO.GetInstant().ListStoInDocs(reqVO.docID, this.BuVO)
                .GroupBy(g => new { g.StorageObject_ID, g.DocumentItem_ID})
                .Select(x=> new { documentItem_ID = x.Key.DocumentItem_ID,
                    storageObject_ID = x.Key.StorageObject_ID,
                    quantity = x.Sum(y=> y.Quantity)}).ToList();
            
            docItems.ForEach(x =>
            {
                var sto = ADO.StorageObjectADO.GetInstant().Get(x.storageObject_ID, StorageObjectType.PACK, false, false, this.BuVO);
                var item = ADO.DataADO.GetInstant().SelectByID<amt_DocumentItem>(x.documentItem_ID, this.BuVO);

                var countQty = x.quantity == null ? 0 : x.quantity + sto.qty;

                sapItems.Add(new SAPReq.Item
                {
                    PHYSINVENTORY = doc.Code,
                    FISCALYEAR = doc.CreateTime.ToString("YYYY"),
                    ITEM = item.Options.Split("=")[1],
                    MATERIAL = sto.code,
                    PLANT = doc.Sou_Branch_ID.Value.ToString(),
                    STGE_LOC = doc.Sou_Warehouse_ID.Value.ToString(),
                    BATCH = sto.batch,
                    STOCK_TYPE = "1",
                    ENTRY_QNT = countQty.ToString(),
                    ENTRY_UOM = sto.unitCode,
                    ZERO_COUNT = sto == null ? "X" : sto.qty == 0 ? "X" : "",
                });
            });
            sapReq.ITEM_DATA = sapItems;

            var res = SAPInterfaceADO.GetInstant().MMI0009_CONFORM_PHYSICALCOUNT(sapReq, this.BuVO);
            return res;
        }
        
    }
}