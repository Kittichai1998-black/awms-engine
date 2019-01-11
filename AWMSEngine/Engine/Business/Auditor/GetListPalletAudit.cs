using AMWUtil.Exception;
using AWMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business.Auditor
{
    public class GetListPalletAudit : BaseEngine<string, GetListPalletAudit.TRes>
    {
        public class TRes
        {
            public long? docID;
            public List<ItemList> itemLists;

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
            }
        }

        protected override TRes ExecuteEngine(string reqVO)
        {
            var listItem = ADO.DocumentADO.GetInstant().ListDocumentCanAudit(reqVO, StorageObjectEventStatus.AUDITING, DocumentTypeID.AUDIT,this.BuVO);
            if (listItem != null)
            {
                var doc = listItem.First();
                var disto = ADO.DocumentADO.GetInstant().ListStoInDocs(doc.ID.Value, this.BuVO);
                List<TRes.ItemList> itemLists = new List<TRes.ItemList>();

                disto.ForEach(x =>
                {
                    var sto = ADO.StorageObjectADO.GetInstant().Get(x.StorageObject_ID, StorageObjectType.PACK, false, false, this.BuVO);
                    itemLists.Add(new TRes.ItemList()
                    {
                        packCode = sto.code,
                        docItemID = x.DocumentItem_ID,
                        baseQty = sto.baseQty,
                        baseUnitCode = sto.baseUnitCode,
                        qty = sto.qty,
                        unitCode = sto.unitCode,
                        unitID = sto.unitID,
                        baseUnitID = sto.baseUnitID,
                    });
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
