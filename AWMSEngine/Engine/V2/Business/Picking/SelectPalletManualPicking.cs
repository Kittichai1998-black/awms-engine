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

namespace AWMSEngine.Engine.V2.Business.Picking
{
    public class SelectPalletManualPicking : BaseEngine<SelectPalletManualPicking.TReq, SelectPalletManualPicking.TRes>
    {
        public class TReq
        {
            public string palletCode;
            public long? warehouseID;
            public long? areaID;
            public long? docID;
            public PickingModeType pickMode;//0 หรือ null = auto , 1=จองสินค้า
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
            public string lot;
            public string batch;
            public string orderNo;
            public string movement;
            public DateTime createtime;
            public List<pickItem> pickItems;

            public class pickItem
            {
                public string itemCode;
                public decimal picked;
                public decimal willPick;
                public string orderNo;
            }

            public class palletItem
            {
                public long? docItemID;
                public string item;
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
            long palletID = 0;
            List<docItem> docItemList = new List<docItem>();
            List<docItem.palletItem> palletItem = new List<docItem.palletItem>();
            docItemList = getDocumentPickingList(reqVO);

            if (reqVO.docID != null)
            {
                docItemList = docItemList.Where(x => x.docID == reqVO.docID.Value).ToList();
                var selectPallet = ADO.StorageObjectADO.GetInstant().Get(reqVO.palletCode, reqVO.warehouseID, reqVO.areaID, false, true, this.BuVO);
                palletID = selectPallet.id.Value;
                var selectPack = selectPallet.ToTreeList().Where(x => x.type == StorageObjectType.PACK).Distinct().ToList();

                foreach (var row in selectPack)
                {
                    var itemCanMap = ADO.DocumentADO.GetInstant().ListItemCanMapV2(row.code, DocumentTypeID.GOODS_ISSUED, reqVO.docID, DocumentEventStatus.WORKING, this.BuVO)
                        .Where(x => x.Sou_StorageObject_ID == row.id && x.Status == EntityStatus.INACTIVE).ToList();
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
                                canPick = x.NeedQty,
                                pick = true,
                                shouldPick = x.NeedQty > row.qty ? row.qty : x.NeedQty,
                                unitType = unitType,
                                item = row.options,
                            });
                        });
                    }
                    else
                    {
                        throw new AMWException(this.Logger, AMWExceptionCode.V1001, "No Product to PICK");
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

        private List<docItem> getDocumentPickingList(TReq reqVO)
        {
            List<docItem> docItemList = new List<docItem>();
            var docCanMap = ADO.DocumentADO.GetInstant().ListDocumentCanMapV2(reqVO.palletCode, StorageObjectEventStatus.PICKING, this.BuVO);
            if (docCanMap.Count == 0)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Pallet นี้ไม่มีเอกสารสำหรับ Picking");

            var pickItemList = new List<docItem.pickItem>();
            docCanMap.ForEach(x =>
            {
                var listitem = ADO.DocumentADO.GetInstant().ListItem(x.ID.Value, this.BuVO);
                pickItemList = listitem.Select(y =>
                {
                    var g = ADO.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(new SQLConditionCriteria[]
                        {
                            new SQLConditionCriteria("DocumentItem_ID", y.ID, SQLOperatorType.EQUALS),
                            new SQLConditionCriteria("Status", EntityStatus.ACTIVE, SQLOperatorType.EQUALS)

                        }
                        , this.BuVO).Sum(xx => xx.BaseQuantity);

                    return new docItem.pickItem()
                    {
                        itemCode = y.Code,
                        picked = g.HasValue ? g.Value : 0, // ถูก pick ไปแล้ว
                        willPick = y.BaseQuantity.Value, //ที่จะ pick
                        orderNo = y.OrderNo

                    };
                }).ToList();

                string des_warehouse = "", des_customer = "", des_suplier = "";
                if (x.Des_Warehouse_ID != null)
                    des_warehouse = this.StaticValue.Warehouses.FirstOrDefault(y => y.ID == x.Des_Warehouse_ID).Name;
                if (x.Des_Customer_ID != null)
                    des_customer = this.StaticValue.Customers.FirstOrDefault(y => y.ID == x.Des_Customer_ID).Name;
                if (x.Des_Supplier_ID != null)
                    des_suplier = this.StaticValue.Suppliers.FirstOrDefault(y => y.ID == x.Des_Supplier_ID).Name;

                docItemList.Add(new docItem()
                {
                    docID = x.ID.Value,
                    docCode = x.Code,
                    lot = x.Lot,
                    batch = x.Batch,
                    destination = des_warehouse != "" ? des_warehouse : des_customer != "" ? des_customer : des_suplier == "" ? des_suplier : null,
                    pickItems = pickItemList,
                    movement = ADO.DataADO.GetInstant().SelectByID<ams_DocumentProcessType>(x.DocumentProcessType_ID, this.BuVO).Name,
                    createtime = x.CreateTime



                });
            });
            return docItemList;
        }
    }
}
