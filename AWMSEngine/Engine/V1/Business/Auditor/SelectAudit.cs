using AMWUtil.Exception;
using AWMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business.Auditor
{
    public class SelectAudit : BaseEngine<string, SelectAudit.TRes>
    {
        public class TRes
        {
            public long? docID;
            public List<ItemList> itemLists;
            public List<PackList> PackLists;

            public class PackList
            {


            }

            public class ItemList
            {
                public long stoID;
                public long docItemID;
                public string packCode;
                public decimal qty;
                public decimal baseQty;
                public long unitID;
                public string unitCode;
                public long baseUnitID;
                public string baseUnitCode;
                public string batch;
                public string orderNo;
                public string lot;
                public string options;

            }
        }

        protected override TRes ExecuteEngine(string reqVO)
        {
            var listItem = ADO.DocumentADO.GetInstant().ListDocumentCanAudit(reqVO, StorageObjectEventStatus.AUDITING, DocumentTypeID.AUDIT ,this.BuVO);

            
            if (listItem.Count > 0)
            {
                var doc = listItem.First();
                var disto = ADO.DocumentADO.GetInstant().ListStoInDocs(doc.ID.Value, this.BuVO);

                var getPalletID = ADO.StorageObjectADO.GetInstant().Get(reqVO, (long?)null, (long?)null, false, false, this.BuVO);
                List<TRes.ItemList> itemLists = new List<TRes.ItemList>();

                var stoList = ADO.StorageObjectADO.GetInstant().Get(getPalletID.id.Value, StorageObjectType.PACK, false, true, this.BuVO);

                disto.ForEach(x =>
                {
                    var sto = ADO.StorageObjectADO.GetInstant().Get(x.Sou_StorageObject_ID, StorageObjectType.PACK, false, false, this.BuVO);
                    
                    if (sto.parentID == getPalletID.id)
                    {
                        itemLists.Add(new TRes.ItemList()
                        {
                            packCode = sto.code,
                            docItemID = x.DocumentItem_ID.Value,
                            baseQty = sto.baseQty,
                            baseUnitCode = sto.baseUnitCode,
                            qty = sto.qty,
                            unitCode = sto.unitCode,
                            unitID = sto.unitID,
                            baseUnitID = sto.baseUnitID,
                            stoID = sto.id.Value,
                            batch = sto.batch,
                            orderNo = sto.orderNo,
                            lot = sto.lot,
                            options = sto.options

                        });
                    }
                    
                });
                var res = new TRes()
                {
                    docID = doc.ID,
                    itemLists = itemLists
                };

                return res;
            }
            else
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบเอกสารสำหรับ Audit");
        }
    }
}
