using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Criteria.SP.Response;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business.Picking
{
    public class SelectPalletPicking : BaseEngine<SelectPalletPicking.TReq, SelectPalletPicking.TRes>
    {
        public class TReq
        {
            public string palletCode;
            public long? warehouseID;
            public long? areaID;
            public long? docID;
        }

        public class TRes
        {
            public string palletCode;
            public long palletID;
            //public List<amt_Document> docList;
            public List<docItem> docItems;
            public List<docItem.palletItem> stos;
        }

        public class docItem
        {
            public long docID;
            public string docCode;
            public string matDoc;
            public string destination;
            public List<pickItem> pickItems;

            public class pickItem
            {
                public string itemCode;
                public decimal picked;
                public decimal willPick;
            }

            public class palletItem
            {
                public long? docItemID;
                public long? STOID;
                public string packCode;
                public bool pick;
                public string batch;
                public string lot;
                public decimal palletQty;
                public decimal shouldPick;
                public decimal canPick;
                public string unitType;
            }
        }

        

        protected override TRes ExecuteEngine(TReq reqVO)
        {
            //List<amt_Document> docList = new List<amt_Document>();
            long palletID = 0;
            List<docItem> docItemList = new List<docItem>();
            List<docItem.palletItem> palletItem = new List<docItem.palletItem>();
            docItemList = getDocmentPickingList(reqVO);
            if (reqVO.docID == null)
            {
            }
            else
            {
                docItemList = docItemList.Where(x => x.docID == reqVO.docID.Value).ToList();

                var selectPallet = ADO.StorageObjectADO.GetInstant().Get(reqVO.palletCode, reqVO.warehouseID, reqVO.areaID, false, true, this.BuVO);
                palletID = selectPallet.id.Value;
                var selectPack = selectPallet.ToTreeList().Where(x => x.type == StorageObjectType.PACK).Distinct().ToList();

                foreach (var row in selectPack)
                {
                    var itemCanMap = (ADO.DocumentADO.GetInstant().ListItemCanMap(row.code, DocumentTypeID.GOODS_ISSUED, reqVO.docID, "11", this.BuVO));
                    var unitType = this.StaticValue.UnitTypes.FirstOrDefault(y => y.ID == row.unitID).Name;

                    if (itemCanMap.Count > 0)
                    {
                        itemCanMap.ForEach(x =>
                        {

                            palletItem.Add(new docItem.palletItem()
                            {
                                docItemID = x.DocumentItem_ID,
                                STOID = row.id,
                                packCode = row.code,
                                batch = row.batch,
                                lot = row.lot,
                                palletQty = row.qty,
                                canPick = (x.MaxQty - x.Qty),
                                pick = true,
                                shouldPick = (x.MaxQty - x.Qty) > row.qty ? row.qty : (x.MaxQty - x.Qty),
                                unitType = unitType
                            });
                        });
                    }
                    else
                    {
                        palletItem.Add(new docItem.palletItem()
                        {
                            packCode = row.code,
                            STOID = row.id,
                            batch = row.batch,
                            palletQty = row.qty,
                            lot = row.lot,
                            canPick = 0,
                            pick = false,
                            shouldPick = 0,
                            unitType = unitType
                        });
                    }

                    var docItem = ADO.DataADO.GetInstant().SelectBy<amt_DocumentItem>(new KeyValuePair<string, object>[] {
                            new KeyValuePair<string,object>("Document_ID",reqVO.docID),
                            new KeyValuePair<string,object>("Status", EntityStatus.ACTIVE)
                        }, this.BuVO);
                }
            }
            
            var res = new TRes()
            {
                palletID = palletID,
                palletCode = reqVO.palletCode,
                docItems = docItemList,
                stos = palletItem
            };
            return res;
        }

        private List<docItem> getDocmentPickingList(TReq reqVO)
        {
            List<docItem> docItemList = new List<docItem>();
            var docCanMap = ADO.DocumentADO.GetInstant().ListDocumentCanMap(reqVO.palletCode, StorageObjectEventStatus.PICKING, this.BuVO);
            if (docCanMap.Count == 0)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Pallet นี้ไม่มีเอกสารสำหรับ Picking");

            var pickItemList = new List<docItem.pickItem>();
            docCanMap.ForEach(x =>
            {
                var listitem = ADO.DocumentADO.GetInstant().ListItem(x.ID.Value, this.BuVO);
                pickItemList = listitem.Select(y =>
                {
                    var g = ADO.DataADO.GetInstant().SelectBy<dynamic>(
                        "amt_DocumentItemStorageObject",
                        "sum(baseQuantity) s",
                        "DocumentItem_ID",
                        new SQLConditionCriteria[] { new SQLConditionCriteria("DocumentItem_ID", y.ID, SQLOperatorType.EQUALS) },
                        null,
                        null,
                        null,
                        this.BuVO).FirstOrDefault();
                    long sumData = g == null ? 0 : (long)g.s;

                    return new docItem.pickItem()
                    {
                        itemCode = y.Code,
                        picked = sumData,
                        willPick = y.Quantity.Value
                    };
                }).ToList();

                string des_warehouse = "", des_customer = "", des_suplier = "";
                if (x.Des_Warehouse_ID != null)
                    des_warehouse = this.StaticValue.Warehouses.FirstOrDefault(y => y.ID == x.Des_Warehouse_ID).Code;
                if (x.Des_Customer_ID != null)
                    des_customer = this.StaticValue.Customers.FirstOrDefault(y => y.ID == x.Des_Customer_ID).Code;
                if (x.Des_Supplier_ID != null)
                    des_suplier = this.StaticValue.Suppliers.FirstOrDefault(y => y.ID == x.Des_Supplier_ID).Code;

                docItemList.Add(new docItem()
                {
                    docID = x.ID.Value,
                    docCode = x.Code,
                    matDoc = x.RefID,
                    destination = des_warehouse != "" ? des_warehouse : des_customer != "" ? des_customer : des_suplier == "" ? des_suplier : null,
                    pickItems = pickItemList
                });
            });
            return docItemList;
        }
    }
}
